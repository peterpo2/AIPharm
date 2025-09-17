using AIPharm.Domain.Entities;
using AIPharm.Infrastructure.Data;

namespace AIPharm.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AIPharmDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (context.Categories.Any())
            {
                return; // Database has been seeded
            }

            // Seed Categories
            var categories = new[]
            {
                new Category { Id = 1, Name = "Обезболяващи", Description = "Лекарства за облекчаване на болка и възпаление", Icon = "pill" },
                new Category { Id = 2, Name = "Витамини", Description = "Хранителни добавки и витамини", Icon = "heart" },
                new Category { Id = 3, Name = "Простуда и грип", Description = "Лекарства за простуда, кашлица и грип", Icon = "thermometer" },
                new Category { Id = 4, Name = "Стомашно-чревни", Description = "Лекарства за храносмилателни проблеми", Icon = "stomach" },
                new Category { Id = 5, Name = "Кожа и коса", Description = "Козметика и дермато-козметични продукти", Icon = "droplet" },
                new Category { Id = 6, Name = "Детски продукти", Description = "Специализирани продукти за деца", Icon = "baby" }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();

            // Seed Products
            var products = new[]
            {
                new Product
                {
                    Id = 1,
                    Name = "Парацетамол 500мг",
                    NameEn = "Paracetamol 500mg",
                    Description = "Ефективно обезболяващо и жаропонижаващо средство за възрастни и деца над 12 години",
                    DescriptionEn = "Effective pain reliever and fever reducer for adults and children over 12 years",
                    Price = 2.30m,
                    StockQuantity = 150,
                    ImageUrl = "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 1,
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
                new Product
                {
                    Id = 2,
                    Name = "Ибупрофен 400мг",
                    NameEn = "Ibuprofen 400mg",
                    Description = "Противовъзпалително и обезболяващо средство за мускулни и ставни болки",
                    DescriptionEn = "Anti-inflammatory and pain relief for muscle and joint pain",
                    Price = 3.17m,
                    StockQuantity = 95,
                    ImageUrl = "https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 1,
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
                new Product
                {
                    Id = 3,
                    Name = "Витамин C 1000мг",
                    NameEn = "Vitamin C 1000mg",
                    Description = "Високодозов витамин C за укрепване на имунната система",
                    DescriptionEn = "High-dose vitamin C for immune system strengthening",
                    Price = 6.54m,
                    StockQuantity = 200,
                    ImageUrl = "https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 2,
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
                new Product
                {
                    Id = 4,
                    Name = "Магнезий + Витамин B6",
                    NameEn = "Magnesium + Vitamin B6",
                    Description = "Комбинация за нервната система и мускулната функция",
                    DescriptionEn = "Combination for nervous system and muscle function",
                    Price = 7.98m,
                    StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 2,
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
                new Product
                {
                    Id = 5,
                    Name = "Сироп за кашлица",
                    NameEn = "Cough Syrup",
                    Description = "Билков сироп за сухо гърло и кашлица",
                    DescriptionEn = "Herbal syrup for dry throat and cough",
                    Price = 4.55m,
                    StockQuantity = 120,
                    ImageUrl = "https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 3,
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
                new Product
                {
                    Id = 6,
                    Name = "Назален спрей",
                    NameEn = "Nasal Spray",
                    Description = "За заложен нос при простуда и алергии",
                    DescriptionEn = "For nasal congestion due to cold and allergies",
                    Price = 5.83m,
                    StockQuantity = 85,
                    ImageUrl = "https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 3,
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
                new Product
                {
                    Id = 7,
                    Name = "Пробиотик комплекс",
                    NameEn = "Probiotic Complex",
                    Description = "За здравословна чревна флора и подобрено храносмилане",
                    DescriptionEn = "For healthy intestinal flora and improved digestion",
                    Price = 11.50m,
                    StockQuantity = 60,
                    ImageUrl = "https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 4,
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
                new Product
                {
                    Id = 8,
                    Name = "Антиацид таблетки",
                    NameEn = "Antacid Tablets",
                    Description = "За киселини и стомашни разстройства",
                    DescriptionEn = "For acidity and stomach disorders",
                    Price = 3.99m,
                    StockQuantity = 110,
                    ImageUrl = "https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 4,
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
                new Product
                {
                    Id = 9,
                    Name = "Хидратиращ крем",
                    NameEn = "Moisturizing Cream",
                    Description = "За суха и чувствителна кожа на лицето и тялото",
                    DescriptionEn = "For dry and sensitive skin on face and body",
                    Price = 9.66m,
                    StockQuantity = 90,
                    ImageUrl = "https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 5,
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
                new Product
                {
                    Id = 10,
                    Name = "Слънцезащитен крем SPF50",
                    NameEn = "Sunscreen Cream SPF50",
                    Description = "Висока защита от UV лъчи за лице и тяло",
                    DescriptionEn = "High protection from UV rays for face and body",
                    Price = 13.09m,
                    StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683096/pexels-photo-3683096.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 5,
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
                new Product
                {
                    Id = 11,
                    Name = "Детски сироп парацетамол",
                    NameEn = "Children Paracetamol Syrup",
                    Description = "Обезболяващо и жаропонижаващо за деца от 3 месеца",
                    DescriptionEn = "Pain reliever and fever reducer for children from 3 months",
                    Price = 4.70m,
                    StockQuantity = 100,
                    ImageUrl = "https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 6,
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
                new Product
                {
                    Id = 12,
                    Name = "Детски витамини",
                    NameEn = "Children Vitamins",
                    Description = "Мултивитамини с приятен вкус на ягода",
                    DescriptionEn = "Multivitamins with pleasant strawberry flavor",
                    Price = 8.38m,
                    StockQuantity = 80,
                    ImageUrl = "https://images.pexels.com/photos/3683106/pexels-photo-3683106.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 6,
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

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Seed Users
            var users = new[]
            {
                new User
                {
                    Id = "admin-user-id",
                    Email = "admin@aipharm.bg",
                    FullName = "Администратор",
                    IsAdmin = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = "demo-user-id",
                    Email = "demo@aipharm.bg",
                    FullName = "Демо Потребител",
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
        }
    }
}