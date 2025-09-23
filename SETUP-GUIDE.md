# 🏥 AIPharm+ - Complete Setup Guide

A modern AI-powered digital pharmacy with React frontend and .NET 8 backend.

## 📋 Prerequisites

### Required Software:
- **Visual Studio 2022** (17.8 or newer) with ASP.NET Core workload
- **.NET 8 SDK** (8.0.100 or newer)
- **Node.js** (18.0 or newer)
- **SQL Server** (LocalDB, Express, or full version)
- **Git** (for version control)

### Check Your Versions:
```powershell
# Check .NET version
dotnet --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

## 🚀 Step-by-Step Setup

### **Step 1: Download & Extract Project**
1. Download the project files
2. Extract to a folder (e.g., `C:\Projects\AIPharm`)
3. You should see:
   ```
   AIPharm/
   ├── AIPharm.Backend/     # .NET 8 Backend
   ├── src/                 # React Frontend
   ├── public/              # Static assets
   ├── package.json         # Frontend dependencies
   └── README.md
   ```

### **Step 2: Setup Backend (.NET 8)**

#### **Open in Visual Studio 2022:**
1. Launch **Visual Studio 2022**
2. Click **File → Open → Project/Solution**
3. Navigate to `AIPharm.Backend\AIPharm.sln`
4. Click **Open**

#### **Verify Project Structure:**
```
AIPharm.Backend/
├── AIPharm.sln              # Solution file
├── AIPharm.Web/             # API Controllers, Startup
├── AIPharm.Core/            # Business Logic, Services
├── AIPharm.Domain/          # Entities, Models
└── AIPharm.Infrastructure/  # Database, Repositories
```

#### **Build the Solution:**
1. Right-click on **Solution 'AIPharm'**
2. Select **Rebuild Solution**
3. Wait for build to complete (should be successful)

#### **Start the Backend:**
1. Set **AIPharm.Web** as startup project (right-click → Set as Startup Project)
2. Press **F5** or **Ctrl+F5** to start
3. Browser opens at `https://localhost:7001/swagger`
4. You should see the Swagger API documentation

#### **Verify Database:**
- Database `AIPharm` is created automatically
- Sample data is loaded (products, categories, users)
- No manual database setup needed!

### **Step 3: Setup Frontend (React)**

#### **Open Terminal in Project Root:**
1. Open **PowerShell** or **Command Prompt**
2. Navigate to project root: `cd C:\Projects\AIPharm`

#### **Install Dependencies:**
```powershell
npm install
```

#### **Start Development Server:**
```powershell
npm run dev
```

#### **Expected Output:**
```
> aipharm-plus@1.0.0 dev
> vite

  VITE v5.4.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### **Open in Browser:**
- Navigate to `http://localhost:5173/`
- You should see the AIPharm+ homepage

## ✅ Verification Checklist

### **Backend Running Successfully:**
- ✅ Visual Studio shows no build errors
- ✅ Browser opens Swagger at `https://localhost:7001/swagger`
- ✅ API endpoints are visible in Swagger
- ✅ Health check returns: `GET /api/health`

### **Frontend Running Successfully:**
- ✅ Terminal shows Vite server running
- ✅ Browser opens at `http://localhost:5173/`
- ✅ Homepage loads with products
- ✅ Language switcher works (БГ/EN)
- ✅ AI chat button appears

### **Full Integration Test:**
- ✅ Products load on homepage
- ✅ Categories filter works
- ✅ Search functionality works
- ✅ Add to cart works
- ✅ AI assistant responds
- ✅ No console errors

## 🔧 Troubleshooting

### **Backend Issues:**

#### **Build Errors:**
```powershell
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

#### **Database Connection Issues:**
- Check SQL Server is running
- Verify connection string in `appsettings.json`
- Try restarting Visual Studio

#### **Port Already in Use:**
- Change ports in `launchSettings.json`
- Or stop other applications using ports 7000/7001

### **Frontend Issues:**

#### **Dependencies Issues:**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### **Port 5173 in Use:**
```powershell
# Kill process using port
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

#### **Build Errors:**
```powershell
# Clear Vite cache
npm run dev -- --force
```

## 📡 API Endpoints

### **Products:**
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?searchTerm=...` - Search products

### **Categories:**
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID

### **Shopping Cart:**
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove from cart

### **AI Assistant:**
- `POST /api/assistant/ask` - Ask AI a question
- `GET /api/assistant/history` - Get conversation history

### **Health Check:**
- `GET /api/health` - System health status

## 🎯 Default Data

### **Sample Users:**
- **Admin:** aipharmplus@outlook.com / Admin123!

Registration confirmations and two-factor emails are sent from `aipharmplus@outlook.com` using Outlook's SMTP servers. If you prefer to capture `.eml` files locally set `Email:UsePickupDirectory` to `true`; otherwise messages go directly to the recipient inbox specified during registration.

### **Sample Products:**
- Парацетамол 500мг - €2.30
- Ибупрофен 400мг - €3.17
- Витамин C 1000мг - €6.54
- And 9+ more products...

### **Categories:**
- Обезболяващи (Painkillers)
- Витамини (Vitamins)
- Простуда и грип (Cold & Flu)
- Стомашно-чревни (Digestive)
- Кожа и коса (Skin & Hair)
- Детски продукти (Children)

## 🌟 Features

### **Frontend Features:**
- 🛒 Smart shopping cart with real-time updates
- 🤖 AI medical assistant with contextual responses
- 🔍 Advanced search (by name, ingredient, category)
- 📱 Fully responsive design (mobile-first)
- 🌍 Multi-language support (Bulgarian/English)
- 🎨 Modern UI with smooth animations
- 💳 Shopping cart with delivery calculations

### **Backend Features:**
- 🏗️ Clean Architecture (Domain, Core, Infrastructure, Web)
- 📊 Entity Framework Core with automatic migrations
- 🔄 AutoMapper for object mapping
- 📚 Swagger/OpenAPI documentation
- 🛡️ CORS enabled for frontend integration
- 🎯 Repository pattern with dependency injection
- 🏥 Health checks and monitoring
- 🌐 Multi-language API responses

## 🚀 Production Deployment

### **Frontend (Netlify/Vercel):**
```powershell
npm run build
# Deploy 'dist' folder
```

### **Backend (Azure/IIS):**
1. Publish from Visual Studio
2. Configure production connection string
3. Ensure database migrations are applied

## 📞 Support

### **Common Issues:**
- **Backend won't start:** Check .NET 8 SDK installation
- **Frontend won't load:** Verify Node.js version 18+
- **Database errors:** Restart Visual Studio, check SQL Server
- **CORS errors:** Ensure backend is running first

### **Getting Help:**
- Check console for error messages
- Verify all prerequisites are installed
- Try the troubleshooting steps above
- Restart both frontend and backend

---

## 🎉 You're Ready!

Both frontend and backend should now be running:
- **Frontend:** http://localhost:5173/
- **Backend API:** https://localhost:7001/swagger

Start exploring the modern AI-powered pharmacy experience! 💊🚀

**Happy Coding!** 🎯