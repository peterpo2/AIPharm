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
            }

            await context.Database.MigrateAsync(ct);

            await EnsureAdminTwoFactorDisabledAsync(context, ct);

            // If we already have data → skip
            if (await context.Categories.AnyAsync(ct))
                return;

            // --- Categories ---
            var categories = new List<Category>
            {
                new() { Name = "Обезболяващи", Description = "Лекарства за облекчаване на болка и възпаление", Icon = "pill" },
                new() { Name = "Витамини", Description = "Хранителни добавки и витамини", Icon = "heart" },
                new() { Name = "Простуда и грип", Description = "Лекарства за простуда, кашлица и грип", Icon = "thermometer" },
                new() { Name = "Стомашно-чревни", Description = "Лекарства за храносмилателни проблеми", Icon = "stomach" },
                new() { Name = "Кожа и коса", Description = "Козметика и дермато-козметични продукти", Icon = "droplet" },
                new() { Name = "Детски продукти", Description = "Специализирани продукти за деца", Icon = "baby" }
            };

            await context.Categories.AddRangeAsync(categories, ct);
            await context.SaveChangesAsync(ct);

            // Build dictionary AFTER save, so IDs are generated
            var catDict = categories.ToDictionary(c => c.Name, c => c.Id);

            // --- Products ---
            var products = new List<Product>
            {
                new() {
                    Name = "Парацетамол 500мг", NameEn = "Paracetamol 500mg",
                    Description = "Ефективно обезболяващо и жаропонижаващо средство за възрастни и деца над 12 години",
                    DescriptionEn = "Effective pain reliever and fever reducer for adults and children over 12 years",
                    Price = 2.30m, StockQuantity = 150,
                    ImageUrl = "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Обезболяващи"], RequiresPrescription = false,
                    ActiveIngredient = "Парацетамол", ActiveIngredientEn = "Paracetamol",
                    Dosage = "500мг", DosageEn = "500mg",
                    Manufacturer = "Актавис", ManufacturerEn = "Actavis",
                    Rating = 4.7m, ReviewCount = 89
                },

                new() {
                    Name = "Ибупрофен 400мг", NameEn = "Ibuprofen 400mg",
                    Description = "Противовъзпалително и обезболяващо средство за мускулни и ставни болки",
                    DescriptionEn = "Anti-inflammatory and pain relief for muscle and joint pain",
                    Price = 3.17m, StockQuantity = 95,
                    ImageUrl = "https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Обезболяващи"], RequiresPrescription = false,
                    ActiveIngredient = "Ибупрофен", ActiveIngredientEn = "Ibuprofen",
                    Dosage = "400мг", DosageEn = "400mg",
                    Manufacturer = "Нувита Фарма", ManufacturerEn = "Nuvita Pharma",
                    Rating = 4.5m, ReviewCount = 67
                },

                new() {
                    Name = "Витамин C 1000мг", NameEn = "Vitamin C 1000mg",
                    Description = "Високодозов витамин C за укрепване на имунната система",
                    DescriptionEn = "High-dose vitamin C for immune system strengthening",
                    Price = 6.54m, StockQuantity = 200,
                    ImageUrl = "https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Витамини"], RequiresPrescription = false,
                    ActiveIngredient = "Аскорбинова киселина", ActiveIngredientEn = "Ascorbic Acid",
                    Dosage = "1000мг", DosageEn = "1000mg",
                    Manufacturer = "Солгар", ManufacturerEn = "Solgar",
                    Rating = 4.8m, ReviewCount = 134
                },

                new() {
                    Name = "Магнезий + Витамин B6", NameEn = "Magnesium + Vitamin B6",
                    Description = "Комбинация за нервната система и мускулната функция",
                    DescriptionEn = "Combination for nervous system and muscle function",
                    Price = 7.98m, StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Витамини"], RequiresPrescription = false,
                    ActiveIngredient = "Магнезий оксид, Пиридоксин", ActiveIngredientEn = "Magnesium Oxide, Pyridoxine",
                    Dosage = "375мг + 2мг", DosageEn = "375mg + 2mg",
                    Manufacturer = "Натура Вита", ManufacturerEn = "Natura Vita",
                    Rating = 4.6m, ReviewCount = 98
                },

                new() {
                    Name = "Сироп за кашлица", NameEn = "Cough Syrup",
                    Description = "Билков сироп за сухо гърло и кашлица",
                    DescriptionEn = "Herbal syrup for dry throat and cough",
                    Price = 4.55m, StockQuantity = 120,
                    ImageUrl = "https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Простуда и грип"], RequiresPrescription = false,
                    ActiveIngredient = "Екстракт от мед и лимон", ActiveIngredientEn = "Honey and Lemon Extract",
                    Dosage = "15мл 3 пъти дневно", DosageEn = "15ml 3 times daily",
                    Manufacturer = "Хербал Медика", ManufacturerEn = "Herbal Medica",
                    Rating = 4.3m, ReviewCount = 76
                },

                new() {
                    Name = "Назален спрей", NameEn = "Nasal Spray",
                    Description = "За заложен нос при простуда и алергии",
                    DescriptionEn = "For nasal congestion due to cold and allergies",
                    Price = 5.83m, StockQuantity = 85,
                    ImageUrl = "https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Простуда и грип"], RequiresPrescription = false,
                    ActiveIngredient = "Ксилометазолин", ActiveIngredientEn = "Xylometazoline",
                    Dosage = "0.1%", DosageEn = "0.1%",
                    Manufacturer = "Рино Фарм", ManufacturerEn = "Rhino Pharm",
                    Rating = 4.4m, ReviewCount = 52
                },

                new() {
                    Name = "Пробиотик комплекс", NameEn = "Probiotic Complex",
                    Description = "За здравословна чревна флора и подобрено храносмилане",
                    DescriptionEn = "For healthy intestinal flora and improved digestion",
                    Price = 11.50m, StockQuantity = 60,
                    ImageUrl = "https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Стомашно-чревни"], RequiresPrescription = false,
                    ActiveIngredient = "Лактобацили и бифидобактерии", ActiveIngredientEn = "Lactobacilli and Bifidobacteria",
                    Dosage = "1 капсула дневно", DosageEn = "1 capsule daily",
                    Manufacturer = "БиоПро", ManufacturerEn = "BioPro",
                    Rating = 4.9m, ReviewCount = 145
                },

                new() {
                    Name = "Антиацид таблетки", NameEn = "Antacid Tablets",
                    Description = "За киселини и стомашни разстройства",
                    DescriptionEn = "For acidity and stomach disorders",
                    Price = 3.99m, StockQuantity = 110,
                    ImageUrl = "https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Стомашно-чревни"], RequiresPrescription = false,
                    ActiveIngredient = "Алуминиев хидроксид", ActiveIngredientEn = "Aluminum Hydroxide",
                    Dosage = "500мг", DosageEn = "500mg",
                    Manufacturer = "ГастроМед", ManufacturerEn = "GastroMed",
                    Rating = 4.2m, ReviewCount = 43
                },

                new() {
                    Name = "Хидратиращ крем", NameEn = "Moisturizing Cream",
                    Description = "За суха и чувствителна кожа на лицето и тялото",
                    DescriptionEn = "For dry and sensitive skin on face and body",
                    Price = 9.66m, StockQuantity = 90,
                    ImageUrl = "https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Кожа и коса"], RequiresPrescription = false,
                    ActiveIngredient = "Хиалуронова киселина", ActiveIngredientEn = "Hyaluronic Acid",
                    Dosage = "Нанасяне 2 пъти дневно", DosageEn = "Apply 2 times daily",
                    Manufacturer = "СкинКеър", ManufacturerEn = "SkinCare",
                    Rating = 4.7m, ReviewCount = 112
                },

                new() {
                    Name = "Слънцезащитен крем SPF50", NameEn = "Sunscreen Cream SPF50",
                    Description = "Висока защита от UV лъчи за лице и тяло",
                    DescriptionEn = "High protection from UV rays for face and body",
                    Price = 13.09m, StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683096/pexels-photo-3683096.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Кожа и коса"], RequiresPrescription = false,
                    ActiveIngredient = "Цинков оксид, Титанов диоксид", ActiveIngredientEn = "Zinc Oxide, Titanium Dioxide",
                    Dosage = "Нанасяне преди излагане на слънце", DosageEn = "Apply before sun exposure",
                    Manufacturer = "СънПротект", ManufacturerEn = "SunProtect",
                    Rating = 4.6m, ReviewCount = 87
                },

                new() {
                    Name = "Детски сироп парацетамол", NameEn = "Children Paracetamol Syrup",
                    Description = "Обезболяващо и жаропонижаващо за деца от 3 месеца",
                    DescriptionEn = "Pain reliever and fever reducer for children from 3 months",
                    Price = 4.70m, StockQuantity = 100,
                    ImageUrl = "https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Детски продукти"], RequiresPrescription = false,
                    ActiveIngredient = "Парацетамол", ActiveIngredientEn = "Paracetamol",
                    Dosage = "120мг/5мл", DosageEn = "120mg/5ml",
                    Manufacturer = "КидsCare", ManufacturerEn = "KidsCare",
                    Rating = 4.8m, ReviewCount = 156
                },

                new() {
                    Name = "Детски витамини", NameEn = "Children Vitamins",
                    Description = "Мултивитамини с приятен вкус на ягода",
                    DescriptionEn = "Multivitamins with pleasant strawberry flavor",
                    Price = 8.38m, StockQuantity = 80,
                    ImageUrl = "https://images.pexels.com/photos/3683106/pexels-photo-3683106.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = catDict["Детски продукти"], RequiresPrescription = false,
                    ActiveIngredient = "Витамини A, C, D, E", ActiveIngredientEn = "Vitamins A, C, D, E",
                    Dosage = "1 таблетка дневно", DosageEn = "1 tablet daily",
                    Manufacturer = "JuniorVit", ManufacturerEn = "JuniorVit",
                    Rating = 4.5m, ReviewCount = 92
                }
            };

            await context.Products.AddRangeAsync(products, ct);

            // --- Users ---
            var now = DateTime.UtcNow;
            var users = new List<User>
            {
                new()
                {
                    Email = "aipharmproject@gmail.com",
                    FullName = "AIPharm Administrator",
                    IsAdmin = true,
                    IsStaff = true,
                    PasswordHash = PasswordHasher.Hash("Admin123!"),
                    PhoneNumber = "+359 88 999 0000",
                    Address = "София, бул. Витоша 25",
                    CreatedAt = now.AddMonths(-6),
                    TwoFactorEnabled = false
                },
                new()
                {
                    Email = "maria.ivanova@example.com",
                    FullName = "Мария Иванова",
                    IsAdmin = false,
                    IsStaff = false,
                    PasswordHash = PasswordHasher.Hash("Customer123!"),
                    PhoneNumber = "+359 88 555 1212",
                    Address = "Пловдив, ул. Капитан Райчо 7",
                    CreatedAt = now.AddMonths(-3),
                    TwoFactorEnabled = true
                },
                new()
                {
                    Email = "georgi.petrov@example.com",
                    FullName = "Георги Петров",
                    IsAdmin = false,
                    IsStaff = false,
                    PasswordHash = PasswordHasher.Hash("Customer456!"),
                    PhoneNumber = "+359 89 444 2323",
                    Address = "Варна, бул. Сливница 102",
                    CreatedAt = now.AddMonths(-2),
                    TwoFactorEnabled = true
                },
                new()
                {
                    Email = "iva.stoyanova@example.com",
                    FullName = "Ива Стоянова",
                    IsAdmin = false,
                    IsStaff = false,
                    PasswordHash = PasswordHasher.Hash("Customer789!"),
                    PhoneNumber = "+359 87 333 3434",
                    Address = "Бургас, ул. Александровска 54",
                    CreatedAt = now.AddMonths(-1),
                    TwoFactorEnabled = true
                },
                new()
                {
                    Email = "diyana.angelova@example.com",
                    FullName = "Дияна Ангелова",
                    IsAdmin = false,
                    IsStaff = true,
                    PasswordHash = PasswordHasher.Hash("Employee123!"),
                    PhoneNumber = "+359 88 321 4455",
                    Address = "София, ул. Иван Вазов 12",
                    CreatedAt = now.AddMonths(-4),
                    TwoFactorEnabled = false
                },
                new()
                {
                    Email = "petar.iliev@example.com",
                    FullName = "Петър Илиев",
                    IsAdmin = false,
                    IsStaff = true,
                    PasswordHash = PasswordHasher.Hash("Employee456!"),
                    PhoneNumber = "+359 89 210 8899",
                    Address = "Пловдив, бул. Христо Ботев 44",
                    CreatedAt = now.AddMonths(-5),
                    TwoFactorEnabled = false
                }
            };

            await context.Users.AddRangeAsync(users, ct);

            await context.SaveChangesAsync(ct);

            Console.WriteLine("✅ Database seeded with categories, products, and demo users.");
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
