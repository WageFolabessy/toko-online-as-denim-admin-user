# Online Clothing Store Admin Frontend

Admin dashboard for e-commerce website built with React.js. This application provides an interface to manage products, categories, orders, shipments, users, and sales reports with responsive design using Tailwind CSS.

## Key Features

- **Dashboard**: Sales, orders, users, and product data summary with interactive charts
- **Product Management**: CRUD products with image upload and rich text editor for descriptions
- **Category Management**: Manage product categories with images
- **Order Management**: View and update customer order status
- **Shipment Management**: Manage shipping data and tracking
- **Payment Management**: Monitor customer payment status
- **User Management**: Manage user accounts and activation status
- **Admin Management**: CRUD admin accounts with various access levels
- **Sales Reports**: Generate reports with PDF export
- **Admin Profile**: Edit profile and admin account information

## Technologies Used

- **React 18** - Main frontend library
- **Vite** - Build tool and development server
- **React Router DOM** - Application routing
- **Tailwind CSS** - CSS framework for styling
- **React Data Table Component** - Data table components
- **React Quill** - Rich text editor
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **Recharts** - Chart library for dashboard
- **jsPDF & jsPDF-AutoTable** - Generate PDF reports
- **PropTypes** - Type checking for React components

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable React components
│   ├── Dashboard/   # Dashboard specific components
│   ├── Product/     # Product management components
│   ├── Category/    # Category management components
│   ├── Order/       # Order management components
│   ├── Shipment/    # Shipment management components
│   ├── Payment/     # Payment management components
│   ├── User/        # User management components
│   ├── Admin/       # Admin management components
│   ├── Profile/     # Admin profile components
│   └── Review/      # Product review components
├── context/         # React Context for state management
├── pages/           # Main application pages
├── services/        # API service functions
├── utils/           # Utility functions
├── App.jsx          # Main application component
└── main.jsx         # Application entry point
```

## Installation and Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd toko-online-as-denim-admin-user
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and adjust `VITE_API_BASE_URL` with your backend API URL.

4. **Run development server**
   ```bash
   npm run dev
   ```
   Application will run at `http://localhost:5174`

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build application for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code linting

## Environment Configuration

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Security Features

- Admin authentication with Laravel Sanctum
- Protected routes for admin pages
- Auto logout when token expires
- Input validation with error handling
- CSRF protection through API headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


