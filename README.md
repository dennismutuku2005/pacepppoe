# ISP Hotspot Portal

A modern, high-performance management dashboard for Internet Service Providers (ISPs) to control MikroTik hotspot systems, manage prepaid vouchers, monitor customer activity, and configure captive portal themes.

![Dashboard Overview](./docs/screenshots/dashboard.png)
*Main dashboard with real-time metrics and system overview*

---

## 🚀 Features

### 📊 **Dashboard & Analytics**
- Real-time system metrics (active users, revenue, bandwidth)
- Visual charts for traffic analysis and income trends
- Quick-access cards for critical operations
- Responsive design optimized for desktop and mobile

### 🎫 **Prepaid Management**
Complete voucher and subscription system with three dedicated modules:

#### **Plans**
- Create and manage prepaid service plans
- Modern plan ID system (PL1, PL2, etc.)
- Pricing model configuration (Fixed Rate, Recurring, Trial)
- Service profile management

<img src="./docs/screenshots/prepaid_plans.png" width="600" alt="Prepaid Plans Interface">

*Prepaid Plans page with compact table design*

#### **Vouchers**
- Generate single or bulk voucher codes
- Router-specific voucher assignment
- Status tracking (ACTIVE/USED)
- Batch operations for high-volume deployments

<img src="./docs/screenshots/prepaid_vouchers.png" width="600" alt="Voucher Management">

*Voucher generation and tracking interface*

#### **Users**
- Prepaid user account management
- Plan assignment and tracking
- Activity monitoring
- Session history

### 👥 **Customers**
- Comprehensive customer ledger (MAC addresses, mobile numbers)
- Transaction history tracking
- Status monitoring (Active/Blocked)
- Read-only interface for data integrity

<img src="./docs/screenshots/customers.png" width="600" alt="Customers">

*Customer management with compact table styling*

### 🎨 **Captive Portal Themes**
- Visual theme library for hotspot landing pages
- Live mobile preview (scaled 50% for optimal viewing)
- Single-active theme enforcement
- Image-based theme simulation

<img src="./docs/screenshots/themes.png" width="600" alt="Theme Management">

*Theme selection with mobile preview modal*

### 🌐 **Router Management**
- MikroTik router node configuration
- Sync status monitoring
- Multi-router deployment support

### 💰 **Financial Tracking**
- M-Pesa transaction integration
- Income reporting and ledger
- Billing management
- Revenue analytics

### 📱 **Communication**
- SMS messaging system
- Push notifications
- Customer alerts

### 🔧 **System Administration**
- Activity logs with pagination
- User settings and preferences
- System configuration
- Granular policy management

### 🔐 **Role-Based Access Control (RBAC)**
The system implements a multi-tier security model to protect ISP infrastructure:

#### **Hierarchy**
*   **Superadmin**: Complete system control. The only role that can manage other Administrators.
*   **Admin**: Business level management. Can manage staff and all core business operations by default.
*   **Staff**: Operator accounts with zero-access by default. Permissions must be explicitly assigned via policies.

#### **Policy Definitions**
| Policy ID | Label | Permission Scope |
| :--- | :--- | :--- |
| `create_voucher` | Hotspot Control | Generate access codes and manage hotspot user directory. |
| `manage_users` | Personnel | Create, edit, or delete staff accounts (standard staff only). |
| `view_income` | Financials | Access earnings dashboard, charts, and transaction logs. |
| `view_routers` | Monitoring | View network health and router station identity. |
| `change_payment` | Billing Auth | **Critical:** Modify Till/Paybill numbers and Bank details. |
| `manage_customers` | CRM | Edit customer profiles and reset device/MAC bindings. |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript/React
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **State Management**: React Hooks

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MikroTik RouterOS (for backend integration)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd isphotspotportal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://your-api-endpoint
   NEXT_PUBLIC_ROUTER_IP=192.168.88.1
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

---

## 🎯 Usage

### Creating Prepaid Plans
1. Navigate to **Prepaid → Plans**
2. Click **"Create Plan"**
3. Configure:
   - Plan name and pricing
   - Pricing model (Fixed/Recurring/Trial)
   - Service identifier
4. Save and activate

### Generating Vouchers
1. Go to **Prepaid → Vouchers**
2. Select target router node
3. Choose plan membership
4. Set quantity
5. Click **"Generate"**

### Managing Themes
1. Access **Themes → Hotspot Theme**
2. Browse available templates
3. Click **"Preview"** to see mobile simulation
4. Click **"Activate"** to deploy (only one active at a time)

---

## 🎨 Design Philosophy

### Compact & Information-Dense
- **Typography**: `text-[11px]` body, `text-[9px]` headers
- **Spacing**: Reduced padding (`px-4 py-3`) for maximum data density
- **Tables**: Standardized flat design across all modules

### Visual Consistency
- **Color Palette**: Purple primary (`#5B21B6`), gray neutrals
- **Status Badges**: Uppercase, bold, color-coded
- **Icons**: 12-14px Lucide icons for actions

### User Experience
- **Single-Active Patterns**: Themes enforce one-at-a-time activation
- **Read-Only Safeguards**: Customers prevents accidental modifications
- **Modal Scaling**: Phone previews use 50% scale to prevent overflow

---

## 📁 Project Structure

```
isphotspotportal/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.js              # Main dashboard
│   │   │   ├── prepaid/
│   │   │   │   ├── plans/           # Plan management
│   │   │   │   ├── vouchers/        # Voucher generation
│   │   │   │   └── users/           # Prepaid users
│   │   │   ├── customers/           # Customers
│   │   │   ├── themes/              # Theme management
│   │   │   ├── routers/             # Router configuration
│   │   │   ├── mpesa/               # M-Pesa integration
│   │   │   ├── billing/             # Billing system
│   │   │   ├── messaging/           # SMS/Notifications
│   │   │   └── settings/            # System settings
│   │   └── login/                   # Authentication
│   ├── components/
│   │   ├── Sidebar.js               # Navigation sidebar
│   │   ├── Badge.js                 # Status badges
│   │   ├── Modal.js                 # Modal dialogs
│   │   └── Skeleton.js              # Loading states
│   └── lib/
│       └── utils.js                 # Utility functions
├── public/
│   └── logoc.png                    # Brand logo
└── README.md
```

---

## 🔐 Security Notes

- Customers is **read-only** (no add/delete operations)
- Theme activation requires explicit user action
- All financial transactions are logged
- Router credentials should be stored securely in environment variables

---

## 🚧 Roadmap

- [ ] Real-time WebSocket integration for live metrics
- [ ] Advanced analytics dashboard with custom date ranges
- [ ] Multi-language support
- [ ] API documentation
- [ ] Docker containerization
- [ ] Automated backup system

---

## 📄 License

Proprietary - All rights reserved

---

## 🤝 Support

For technical support or feature requests, contact the development team.

---

## 📸 Screenshots

### Dashboard
<img src="./docs/screenshots/dashboard.png" width="700" alt="Dashboard">

### Prepaid Plans
<img src="./docs/screenshots/prepaid_plans.png" width="700" alt="Plans">

### Voucher Management
<img src="./docs/screenshots/prepaid_vouchers.png" width="700" alt="Vouchers">

### Customers
<img src="./docs/screenshots/customers.png" width="700" alt="Customers">

### Theme Preview
<img src="./docs/screenshots/themes.png" width="700" alt="Themes">

---

**Built with ❤️ for ISPs managing MikroTik hotspot **#   p a c e p p p o e  
 