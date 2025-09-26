using System;
using System.Collections.Generic;
using System.Linq;
using AIPharm.Core.Security;
using AIPharm.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIPharm.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AIPharmDbContext context, bool dropAndRecreate, CancellationToken ct = default)
        {
            if (dropAndRecreate)
            {
                await context.Database.EnsureDeletedAsync(ct);
                Console.WriteLine("✅ Existing database dropped.");
            }

            await EnsureDatabaseSchemaAsync(context, ct);

            await EnsureAdminTwoFactorDisabledAsync(context, ct);

            var categorySeeds = new (string Name, string Description, string Icon)[]
            {
                ("Обезболяващи", "Лекарства за облекчаване на болка и възпаление", "pill"),
                ("Витамини", "Хранителни добавки и витамини", "heart"),
                ("Простуда и грип", "Лекарства за простуда, кашлица и грип", "thermometer"),
                ("Стомашно-чревни", "Лекарства за храносмилателни проблеми", "stomach"),
                ("Кожа и коса", "Козметика и дермато-козметични продукти", "droplet"),
                ("Детски продукти", "Специализирани продукти за деца", "baby")
            };

            var categoryNameSet = new HashSet<string>(categorySeeds.Select(c => c.Name), StringComparer.OrdinalIgnoreCase);
            var existingCategories = await context.Categories.AsNoTracking().ToListAsync(ct);
            var existingCategoryNames = new HashSet<string>(existingCategories.Select(c => c.Name), StringComparer.OrdinalIgnoreCase);

            var newCategories = categorySeeds
                .Where(seed => !existingCategoryNames.Contains(seed.Name))
                .Select(seed => new Category
                {
                    Name = seed.Name,
                    Description = seed.Description,
                    Icon = seed.Icon
                })
                .ToList();

            if (newCategories.Count > 0)
            {
                await context.Categories.AddRangeAsync(newCategories, ct);
                await context.SaveChangesAsync(ct);
                existingCategories = await context.Categories.AsNoTracking().ToListAsync(ct);
            }

            var categoryDictionary = existingCategories
                .Where(c => categoryNameSet.Contains(c.Name))
                .ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);

            var productSeeds = new[]
            {
                new
                {
                    Name = "Парацетамол 500мг",
                    NameEn = "Paracetamol 500mg",
                    Description = "Ефективно обезболяващо и жаропонижаващо средство за възрастни и деца над 12 години",
                    DescriptionEn = "Effective pain reliever and fever reducer for adults and children over 12 years",
                    Price = 2.30m,
                    StockQuantity = 150,
                    ImageUrl = "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Обезболяващи",
                    RequiresPrescription = false,
                    ActiveIngredient = "Парацетамол",
                    ActiveIngredientEn = "Paracetamol",
                    Dosage = "500мг",
                    DosageEn = "500mg",
                    Manufacturer = "Актавис",
                    ManufacturerEn = "Actavis",
                    Rating = 4.7m,
                    ReviewCount = 89
                },
                new
                {
                    Name = "Ибупрофен 400мг",
                    NameEn = "Ibuprofen 400mg",
                    Description = "Противовъзпалително и обезболяващо средство за мускулни и ставни болки",
                    DescriptionEn = "Anti-inflammatory and pain relief for muscle and joint pain",
                    Price = 3.17m,
                    StockQuantity = 95,
                    ImageUrl = "https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Обезболяващи",
                    RequiresPrescription = false,
                    ActiveIngredient = "Ибупрофен",
                    ActiveIngredientEn = "Ibuprofen",
                    Dosage = "400мг",
                    DosageEn = "400mg",
                    Manufacturer = "Нувита Фарма",
                    ManufacturerEn = "Nuvita Pharma",
                    Rating = 4.5m,
                    ReviewCount = 67
                },
                new
                {
                    Name = "Витамин C 1000мг",
                    NameEn = "Vitamin C 1000mg",
                    Description = "Високодозов витамин C за укрепване на имунната система",
                    DescriptionEn = "High-dose vitamin C for immune system strengthening",
                    Price = 6.54m,
                    StockQuantity = 200,
                    ImageUrl = "https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Витамини",
                    RequiresPrescription = false,
                    ActiveIngredient = "Аскорбинова киселина",
                    ActiveIngredientEn = "Ascorbic Acid",
                    Dosage = "1000мг",
                    DosageEn = "1000mg",
                    Manufacturer = "Солгар",
                    ManufacturerEn = "Solgar",
                    Rating = 4.8m,
                    ReviewCount = 134
                },
                new
                {
                    Name = "Магнезий + Витамин B6",
                    NameEn = "Magnesium + Vitamin B6",
                    Description = "Комбинация за нервната система и мускулната функция",
                    DescriptionEn = "Combination for nervous system and muscle function",
                    Price = 7.98m,
                    StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Витамини",
                    RequiresPrescription = false,
                    ActiveIngredient = "Магнезий оксид, Пиридоксин",
                    ActiveIngredientEn = "Magnesium Oxide, Pyridoxine",
                    Dosage = "375мг + 2мг",
                    DosageEn = "375mg + 2mg",
                    Manufacturer = "Натура Вита",
                    ManufacturerEn = "Natura Vita",
                    Rating = 4.6m,
                    ReviewCount = 98
                },
                new
                {
                    Name = "Сироп за кашлица",
                    NameEn = "Cough Syrup",
                    Description = "Билков сироп за сухо гърло и кашлица",
                    DescriptionEn = "Herbal syrup for dry throat and cough",
                    Price = 4.55m,
                    StockQuantity = 120,
                    ImageUrl = "https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Простуда и грип",
                    RequiresPrescription = false,
                    ActiveIngredient = "Екстракт от мед и лимон",
                    ActiveIngredientEn = "Honey and Lemon Extract",
                    Dosage = "15мл 3 пъти дневно",
                    DosageEn = "15ml 3 times daily",
                    Manufacturer = "Хербал Медика",
                    ManufacturerEn = "Herbal Medica",
                    Rating = 4.3m,
                    ReviewCount = 76
                },
                new
                {
                    Name = "Назален спрей",
                    NameEn = "Nasal Spray",
                    Description = "За заложен нос при простуда и алергии",
                    DescriptionEn = "For nasal congestion due to cold and allergies",
                    Price = 5.83m,
                    StockQuantity = 85,
                    ImageUrl = "https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Простуда и грип",
                    RequiresPrescription = false,
                    ActiveIngredient = "Ксилометазолин",
                    ActiveIngredientEn = "Xylometazoline",
                    Dosage = "0.1%",
                    DosageEn = "0.1%",
                    Manufacturer = "Рино Фарм",
                    ManufacturerEn = "Rhino Pharm",
                    Rating = 4.4m,
                    ReviewCount = 52
                },
                new
                {
                    Name = "Пробиотик комплекс",
                    NameEn = "Probiotic Complex",
                    Description = "За здравословна чревна флора и подобрено храносмилане",
                    DescriptionEn = "For healthy intestinal flora and improved digestion",
                    Price = 11.50m,
                    StockQuantity = 60,
                    ImageUrl = "https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Стомашно-чревни",
                    RequiresPrescription = false,
                    ActiveIngredient = "Лактобацили и бифидобактерии",
                    ActiveIngredientEn = "Lactobacilli and Bifidobacteria",
                    Dosage = "1 капсула дневно",
                    DosageEn = "1 capsule daily",
                    Manufacturer = "БиоПро",
                    ManufacturerEn = "BioPro",
                    Rating = 4.9m,
                    ReviewCount = 145
                },
                new
                {
                    Name = "Антиацид таблетки",
                    NameEn = "Antacid Tablets",
                    Description = "За киселини и стомашни разстройства",
                    DescriptionEn = "For acidity and stomach disorders",
                    Price = 3.99m,
                    StockQuantity = 110,
                    ImageUrl = "https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Стомашно-чревни",
                    RequiresPrescription = false,
                    ActiveIngredient = "Алуминиев хидроксид",
                    ActiveIngredientEn = "Aluminum Hydroxide",
                    Dosage = "500мг",
                    DosageEn = "500mg",
                    Manufacturer = "ГастроМед",
                    ManufacturerEn = "GastroMed",
                    Rating = 4.2m,
                    ReviewCount = 43
                },
                new
                {
                    Name = "Хидратиращ крем",
                    NameEn = "Moisturizing Cream",
                    Description = "За суха и чувствителна кожа на лицето и тялото",
                    DescriptionEn = "For dry and sensitive skin on face and body",
                    Price = 9.66m,
                    StockQuantity = 90,
                    ImageUrl = "https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Кожа и коса",
                    RequiresPrescription = false,
                    ActiveIngredient = "Хиалуронова киселина",
                    ActiveIngredientEn = "Hyaluronic Acid",
                    Dosage = "Нанасяне 2 пъти дневно",
                    DosageEn = "Apply 2 times daily",
                    Manufacturer = "СкинКеър",
                    ManufacturerEn = "SkinCare",
                    Rating = 4.7m,
                    ReviewCount = 112
                },
                new
                {
                    Name = "Слънцезащитен крем SPF50",
                    NameEn = "Sunscreen Cream SPF50",
                    Description = "Висока защита от UV лъчи за лице и тяло",
                    DescriptionEn = "High protection from UV rays for face and body",
                    Price = 13.09m,
                    StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683096/pexels-photo-3683096.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Кожа и коса",
                    RequiresPrescription = false,
                    ActiveIngredient = "Цинков оксид, Титанов диоксид",
                    ActiveIngredientEn = "Zinc Oxide, Titanium Dioxide",
                    Dosage = "Нанасяне преди излагане на слънце",
                    DosageEn = "Apply before sun exposure",
                    Manufacturer = "СънПротект",
                    ManufacturerEn = "SunProtect",
                    Rating = 4.6m,
                    ReviewCount = 87
                },
                new
                {
                    Name = "Детски сирп парацетамол",
                    NameEn = "Children Paracetamol Syrup",
                    Description = "Обезболяващо и жаропонижаващо за деца от 3 месеца",
                    DescriptionEn = "Pain reliever and fever reducer for children from 3 months",
                    Price = 4.70m,
                    StockQuantity = 100,
                    ImageUrl = "https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Детски продукти",
                    RequiresPrescription = false,
                    ActiveIngredient = "Парацетамол",
                    ActiveIngredientEn = "Paracetamol",
                    Dosage = "120мг/5мл",
                    DosageEn = "120mg/5ml",
                    Manufacturer = "КидsCare",
                    ManufacturerEn = "KidsCare",
                    Rating = 4.8m,
                    ReviewCount = 156
                },
                new
                {
                    Name = "Детски витамини",
                    NameEn = "Children Vitamins",
                    Description = "Мултивитамини с приятен вкус на ягода",
                    DescriptionEn = "Multivitamins with pleasant strawberry flavor",
                    Price = 8.38m,
                    StockQuantity = 80,
                    ImageUrl = "https://images.pexels.com/photos/3683106/pexels-photo-3683106.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Детски продукти",
                    RequiresPrescription = false,
                    ActiveIngredient = "Витамини A, C, D, E",
                    ActiveIngredientEn = "Vitamins A, C, D, E",
                    Dosage = "1 таблетка дневно",
                    DosageEn = "1 tablet daily",
                    Manufacturer = "JuniorVit",
                    ManufacturerEn = "JuniorVit",
                    Rating = 4.5m,
                    ReviewCount = 92
                }
            };

            var existingProductNames = new HashSet<string>(
                await context.Products.AsNoTracking().Select(p => p.Name).ToListAsync(ct),
                StringComparer.OrdinalIgnoreCase);

            var newProducts = productSeeds
                .Where(seed => categoryDictionary.ContainsKey(seed.Category) && !existingProductNames.Contains(seed.Name))
                .Select(seed => new Product
                {
                    Name = seed.Name,
                    NameEn = seed.NameEn,
                    Description = seed.Description,
                    DescriptionEn = seed.DescriptionEn,
                    Price = seed.Price,
                    StockQuantity = seed.StockQuantity,
                    ImageUrl = seed.ImageUrl,
                    CategoryId = categoryDictionary[seed.Category],
                    RequiresPrescription = seed.RequiresPrescription,
                    ActiveIngredient = seed.ActiveIngredient,
                    ActiveIngredientEn = seed.ActiveIngredientEn,
                    Dosage = seed.Dosage,
                    DosageEn = seed.DosageEn,
                    Manufacturer = seed.Manufacturer,
                    ManufacturerEn = seed.ManufacturerEn,
                    Rating = seed.Rating,
                    ReviewCount = seed.ReviewCount,
                    VatRate = 0.20m
                })
                .ToList();

            if (newProducts.Count > 0)
            {
                await context.Products.AddRangeAsync(newProducts, ct);
                await context.SaveChangesAsync(ct);
                Console.WriteLine($"✅ Seeded {newProducts.Count} demo product(s).");
            }

            var userSeeds = new[]
            {
                new
                {
                    Email = "aipharmproject@gmail.com",
                    FullName = "AIPharm Administrator",
                    IsAdmin = true,
                    IsStaff = true,
                    Password = "Admin123!",
                    PhoneNumber = "+359 88 999 0000",
                    Address = "София, бул. Витоша 25",
                    CreatedOffsetMonths = -6,
                    TwoFactorEnabled = false
                },
                new
                {
                    Email = "maria.ivanova@example.com",
                    FullName = "Мария Иванова",
                    IsAdmin = false,
                    IsStaff = false,
                    Password = "Customer123!",
                    PhoneNumber = "+359 88 555 1212",
                    Address = "Пловдив, ул. Капитан Райчо 7",
                    CreatedOffsetMonths = -3,
                    TwoFactorEnabled = true
                },
                new
                {
                    Email = "georgi.petrov@example.com",
                    FullName = "Георги Петров",
                    IsAdmin = false,
                    IsStaff = false,
                    Password = "Customer456!",
                    PhoneNumber = "+359 89 444 2323",
                    Address = "Варна, бул. Сливница 102",
                    CreatedOffsetMonths = -2,
                    TwoFactorEnabled = true
                },
                new
                {
                    Email = "iva.stoyanova@example.com",
                    FullName = "Ива Стоянова",
                    IsAdmin = false,
                    IsStaff = false,
                    Password = "Customer789!",
                    PhoneNumber = "+359 87 333 3434",
                    Address = "Бургас, ул. Александровска 54",
                    CreatedOffsetMonths = -1,
                    TwoFactorEnabled = true
                },
                new
                {
                    Email = "diyana.angelova@example.com",
                    FullName = "Дияна Ангелова",
                    IsAdmin = false,
                    IsStaff = true,
                    Password = "Employee123!",
                    PhoneNumber = "+359 88 321 4455",
                    Address = "София, ул. Иван Вазов 12",
                    CreatedOffsetMonths = -4,
                    TwoFactorEnabled = false
                },
                new
                {
                    Email = "petar.iliev@example.com",
                    FullName = "Петър Илиев",
                    IsAdmin = false,
                    IsStaff = true,
                    Password = "Employee456!",
                    PhoneNumber = "+359 89 210 8899",
                    Address = "Пловдив, бул. Христо Ботев 44",
                    CreatedOffsetMonths = -5,
                    TwoFactorEnabled = false
                }
            };

            var existingUserEmails = new HashSet<string>(
                await context.Users.AsNoTracking().Select(u => u.Email).ToListAsync(ct),
                StringComparer.OrdinalIgnoreCase);

            var now = DateTime.UtcNow;
            var newUsers = userSeeds
                .Where(seed => !existingUserEmails.Contains(seed.Email))
                .Select(seed => new User
                {
                    Email = seed.Email,
                    FullName = seed.FullName,
                    IsAdmin = seed.IsAdmin,
                    IsStaff = seed.IsStaff,
                    PasswordHash = PasswordHasher.Hash(seed.Password),
                    PhoneNumber = seed.PhoneNumber,
                    Address = seed.Address,
                    CreatedAt = now.AddMonths(seed.CreatedOffsetMonths),
                    TwoFactorEnabled = seed.TwoFactorEnabled
                })
                .ToList();

            if (newUsers.Count > 0)
            {
                await context.Users.AddRangeAsync(newUsers, ct);
                await context.SaveChangesAsync(ct);
                Console.WriteLine($"✅ Seeded {newUsers.Count} demo user(s).");
            }
        }

        private static async Task EnsureDatabaseSchemaAsync(AIPharmDbContext context, CancellationToken ct)
        {
            var migrations = context.Database.GetMigrations().ToList();

            if (migrations.Any())
            {
                var pendingMigrations = await context.Database.GetPendingMigrationsAsync(ct);

                if (pendingMigrations.Any())
                {
                    await context.Database.MigrateAsync(ct);
                    Console.WriteLine($"✅ Applied {pendingMigrations.Count()} pending migration(s).");
                }
                else
                {
                    Console.WriteLine("ℹ️ Database schema already up to date (migrations).");
                }

                return;
            }

            var created = await context.Database.EnsureCreatedAsync(ct);

            if (created)
            {
                Console.WriteLine("✅ Database schema created via EnsureCreated (no migrations detected).");
            }
            else
            {
                Console.WriteLine("ℹ️ Database already exists; EnsureCreated skipped (no migrations detected).");
            }
        }

        private static async Task EnsureAdminTwoFactorDisabledAsync(AIPharmDbContext context, CancellationToken ct)
        {
            var adminUsers = await context.Users
                .Where(u => u.IsAdmin && u.TwoFactorEnabled)
                .ToListAsync(ct);

            if (adminUsers.Count == 0)
            {
                return;
            }

            foreach (var admin in adminUsers)
            {
                admin.TwoFactorEnabled = false;
                admin.TwoFactorEmailCodeHash = null;
                admin.TwoFactorEmailCodeExpiry = null;
                admin.TwoFactorEmailCodeAttempts = 0;
                admin.TwoFactorLastSentAt = null;
                admin.TwoFactorLoginToken = null;
                admin.TwoFactorLoginTokenExpiry = null;
            }

            await context.SaveChangesAsync(ct);

            Console.WriteLine($"✅ Disabled two-factor authentication for {adminUsers.Count} admin account(s).");
        }
    }
}
