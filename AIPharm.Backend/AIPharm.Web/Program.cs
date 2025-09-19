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

// Basic API services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT
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

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// EF Core
builder.Services.AddDbContextPool<AIPharmDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repos & services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IAssistantService, AssistantService>(); 
builder.Services.AddHealthChecks().AddDbContextCheck<AIPharmDbContext>("db");


// CORS for local & docker dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://frontend:3000",
                "http://aipharm-frontend:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

// Health checks (simple)
builder.Services.AddHealthChecks();

var app = builder.Build();

// Swagger � keep on in dev
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "AIPharm API v1");
});

// In Docker you typically set ASPNETCORE_ENVIRONMENT=Development; skip HTTPS redirect then
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// root ping + health
app.MapGet("/", () =>
    Results.Ok(new { name = "AIPharm API", env = app.Environment.EnvironmentName, time = DateTime.UtcNow }))
    .WithName("Root");

app.MapHealthChecks("/health");

// DB migrate + seed on startup
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AIPharmDbContext>();
    try
    {
        var drop = (Environment.GetEnvironmentVariable("DROP_DB_ON_STARTUP") ?? "false")
                      .Equals("true", StringComparison.OrdinalIgnoreCase);

        await DbInitializer.InitializeAsync(ctx, drop);
        Console.WriteLine("✅ Database migrated and initialized.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ DB init error: {ex.Message}");
    }
}

app.Run();
