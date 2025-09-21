using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using AIPharm.Infrastructure.Data;
using AIPharm.Infrastructure.Repositories;
using AIPharm.Core.Interfaces;
using AIPharm.Core.Services;
using AIPharm.Core.Mapping;

var builder = WebApplication.CreateBuilder(args);

// === Controllers / Swagger ===
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// === Response caching ===
builder.Services.AddResponseCaching(options =>
{
    options.MaximumBodySize = 1024 * 1024; // 1 MB per cached response
    options.UseCaseSensitivePaths = false;
});

// === In-memory caching ===
builder.Services.AddMemoryCache();

// === JWT Authentication ===
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

// === AutoMapper ===
builder.Services.AddAutoMapper(typeof(MappingProfile));

// === EF Core DbContext ===
builder.Services.AddDbContextPool<AIPharmDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// === Repositories & Services ===
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IAssistantService, AssistantService>();

// === Health checks ===
builder.Services.AddHealthChecks().AddDbContextCheck<AIPharmDbContext>("db");

// === CORS ===
// Reads from ALLOWED_CORS_ORIGINS in .env.prod
// Multiple values can be separated with ; or ,
var allowedOriginsRaw = builder.Configuration["ALLOWED_CORS_ORIGINS"] 
                        ?? "http://localhost";
var allowedOrigins = allowedOriginsRaw.Split(
    new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// === Swagger (always available) ===
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "AIPharm API v1");
});

// === HTTPS redirection (skip in Docker) ===
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseResponseCaching();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// === Root health check endpoints ===
app.MapGet("/", () =>
    Results.Ok(new
    {
        name = "AIPharm API",
        env = app.Environment.EnvironmentName,
        time = DateTime.UtcNow
    }))
    .WithName("Root");

app.MapHealthChecks("/health");

// === Auto-migrate & seed database ===
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var ctx = scope.ServiceProvider.GetRequiredService<AIPharmDbContext>();
    try
    {
        var drop = (Environment.GetEnvironmentVariable("DROP_DB_ON_STARTUP") ?? "false")
                   .Equals("true", StringComparison.OrdinalIgnoreCase);

        if (drop)
        {
            Console.WriteLine("⚠️ Dropping and recreating database...");
            await ctx.Database.EnsureDeletedAsync();
        }

        await ctx.Database.MigrateAsync();
        await DbInitializer.InitializeAsync(ctx, drop);

        Console.WriteLine("✅ Database migrated and seeded.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ DB init error: {ex.Message}");
    }
}

app.Run();

public partial class Program
{
}
