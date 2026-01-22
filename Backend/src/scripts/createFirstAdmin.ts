import { hash } from "bcrypt";
import { UserDao } from "../daos/UserDao";
import { AdminProfileDao } from "../daos/AdminProfileDao";

/**
 * Script to create the first admin user
 * Run this once to set up your initial admin account
 *
 * Usage: npx ts-node src/scripts/createFirstAdmin.ts
 */

async function createFirstAdmin() {
  try {
    const adminEmail = "admin@swiftmart.com"; // Change this
    const adminPassword = "Admin@123456"; // Change this to a strong password
    const adminName = "System Administrator";

    // Check if admin already exists
    const existingAdmin = await UserDao.findUserByEmail(adminEmail);
    if (existingAdmin) {
      console.log(`❌ Admin with email ${adminEmail} already exists!`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await hash(adminPassword, 10);

    // Create admin user
    const adminUser = await UserDao.createUser({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      is_verified_email: true, // Auto-verify first admin
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);

    // Create admin profile
    const adminProfile = await AdminProfileDao.createAdminProfile(
      adminUser.id!,
      {
        department: "System Administration",
        permissions: {
          manage_users: true,
          manage_sellers: true,
          manage_admins: true,
          manage_products: true,
          manage_orders: true,
          view_reports: true,
        },
      },
    );

    console.log(`✅ Admin profile created successfully!`);
    console.log(`   Profile ID: ${adminProfile.id}`);
    console.log(`   Department: ${adminProfile.department}`);
    console.log(`\n🎉 First admin setup complete!`);
    console.log(`\n⚠️  IMPORTANT: Change the password after first login!`);
    console.log(`   Login at: POST /login`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

// Run the script
createFirstAdmin();
