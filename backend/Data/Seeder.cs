using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class Seeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var userManager = services.GetRequiredService<UserManager<TeamMember>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var context = services.GetRequiredService<TeamDbContext>();

            string[] roles = [Roles.Admin, Roles.Manager, Roles.Regular];
            foreach(var role in roles)
            {
                if(!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole (role));
                }
            }

            if (!await context.Departments.AnyAsync())
            {
                context.Departments.AddRange(
                    new Department { DepartmentName = "IT" },
                    new Department { DepartmentName = "HR" },
                    new Department { DepartmentName = "Finance" },
                    new Department { DepartmentName = "Sales" },
                    new Department { DepartmentName = "Marketing" }
                );
            }

                await context.SaveChangesAsync();

                const string adminEmail = "admin@admin.com";
            var admin = await userManager.FindByEmailAsync(adminEmail);
            var itDepartment = await context.Departments
                .FirstAsync(d => d.DepartmentName == "IT");
            if (admin is null)
            {
                admin = new TeamMember
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "Admin",
                    LastName = "Admin",
                    DateJoined = DateTime.UtcNow,
                    JobTitle = "Administrator",
                    DepartmentId = itDepartment.Id
                };

                var result = await userManager.CreateAsync(admin, "Admin123!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, Roles.Admin);
                }
            }
        }
    }

    public static class Roles
    {
        public const string Admin = "admin";
        public const string Manager = "manager";
        public const string Regular = "regular";
    }
}
