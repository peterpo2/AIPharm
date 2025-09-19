using Microsoft.EntityFrameworkCore;
using AIPharm.Domain.Entities;

namespace AIPharm.Infrastructure.Data
{
      public class AIPharmDbContext : DbContext
      {
            public AIPharmDbContext(DbContextOptions<AIPharmDbContext> options) : base(options)
            {
            }

            public DbSet<User> Users { get; set; }
            public DbSet<Category> Categories { get; set; }
            public DbSet<Product> Products { get; set; }
            public DbSet<ShoppingCart> ShoppingCarts { get; set; }
            public DbSet<CartItem> CartItems { get; set; }
            public DbSet<Order> Orders { get; set; }
            public DbSet<OrderItem> OrderItems { get; set; }
            public DbSet<AssistantMessage> AssistantMessages { get; set; }
            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                  base.OnModelCreating(modelBuilder);

                  // ===== ASSISTANT MESSAGES =====
                  modelBuilder.Entity<AssistantMessage>(entity =>
                  {
                        entity.ToTable("AssistantMessages", "dbo");
                        entity.HasKey(e => e.Id);
                        entity.Property(e => e.Id).UseIdentityColumn();
                        entity.Property(e => e.Content).IsRequired();
                  });
                  // ===== USERS =====
                  modelBuilder.Entity<User>(entity =>
                  {
                        entity.ToTable("Users", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();   // auto increment

                        entity.HasIndex(e => e.Email).IsUnique();
                        entity.Property(e => e.Email).IsRequired();
                  });

                  // ===== CATEGORIES =====
                  modelBuilder.Entity<Category>(entity =>
                  {
                        entity.ToTable("Categories", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();

                        entity.Property(e => e.Name)
                        .IsRequired()
                        .HasMaxLength(100);

                        entity.Property(e => e.Icon)
                        .IsRequired()
                        .HasMaxLength(50);

                        entity.HasQueryFilter(e => !e.IsDeleted);
                  });

                  // ===== PRODUCTS =====
                  modelBuilder.Entity<Product>(entity =>
                  {
                        entity.ToTable("Products", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();

                        entity.Property(e => e.Name)
                        .IsRequired()
                        .HasMaxLength(200);

                        entity.Property(e => e.Price)
                        .HasColumnType("decimal(10,2)");

                        entity.Property(e => e.Rating)
                        .HasColumnType("decimal(3,2)");

                        entity.HasOne(e => e.Category)
                        .WithMany(c => c.Products)
                        .HasForeignKey(e => e.CategoryId)
                        .OnDelete(DeleteBehavior.Restrict);

                        entity.HasQueryFilter(e => !e.IsDeleted);
                  });

                  // ===== SHOPPING CARTS =====
                  modelBuilder.Entity<ShoppingCart>(entity =>
                  {
                        entity.ToTable("ShoppingCarts", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();

                        entity.HasOne(e => e.User)
                        .WithMany(u => u.ShoppingCarts)
                        .HasForeignKey(e => e.UserId)
                        .OnDelete(DeleteBehavior.Cascade);
                  });

                  // ===== CART ITEMS =====
                  modelBuilder.Entity<CartItem>(entity =>
                  {
                        entity.ToTable("CartItems", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();

                        entity.Property(e => e.UnitPrice)
                        .HasColumnType("decimal(10,2)");

                        entity.HasOne(ci => ci.ShoppingCart)
                        .WithMany(sc => sc.Items)
                        .HasForeignKey(ci => ci.ShoppingCartId)
                        .OnDelete(DeleteBehavior.Cascade);

                        entity.HasOne(ci => ci.Product)
                        .WithMany(p => p.CartItems)
                        .HasForeignKey(ci => ci.ProductId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ===== ORDERS =====
                  modelBuilder.Entity<Order>(entity =>
                  {
                        entity.ToTable("Orders", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();

                        entity.Property(e => e.OrderNumber)
                        .IsRequired()
                        .HasMaxLength(100);

                        entity.Property(e => e.Total)
                        .HasColumnType("decimal(10,2)");

                        entity.Property(e => e.DeliveryFee)
                        .HasColumnType("decimal(10,2)");

                        entity.HasOne(o => o.User)
                        .WithMany(u => u.Orders)
                        .HasForeignKey(o => o.UserId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ===== ORDER ITEMS =====
                  modelBuilder.Entity<OrderItem>(entity =>
                  {
                        entity.ToTable("OrderItems", "dbo");
                        entity.HasKey(e => e.Id);

                        entity.Property(e => e.Id)
                        .ValueGeneratedOnAdd();

                        entity.Property(e => e.UnitPrice)
                        .HasColumnType("decimal(10,2)");

                        entity.Property(e => e.ProductName)
                        .IsRequired()
                        .HasMaxLength(200);

                        entity.HasOne(oi => oi.Order)
                        .WithMany(o => o.Items)
                        .HasForeignKey(oi => oi.OrderId)
                        .OnDelete(DeleteBehavior.Cascade);

                        entity.HasOne(oi => oi.Product)
                        .WithMany(p => p.OrderItems)
                        .HasForeignKey(oi => oi.ProductId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });
            }
      }
}
