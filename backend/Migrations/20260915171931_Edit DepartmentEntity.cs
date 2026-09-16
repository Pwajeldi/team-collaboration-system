using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class EditDepartmentEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Departments_AspNetUsers_ManagerId1",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_ManagerId1",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "ManagerId1",
                table: "Departments");

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId1",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DepartmentId1",
                table: "AspNetUsers",
                column: "DepartmentId1",
                unique: true,
                filter: "[DepartmentId1] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Departments_DepartmentId1",
                table: "AspNetUsers",
                column: "DepartmentId1",
                principalTable: "Departments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Departments_DepartmentId1",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_DepartmentId1",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DepartmentId1",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "ManagerId1",
                table: "Departments",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ManagerId1",
                table: "Departments",
                column: "ManagerId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_AspNetUsers_ManagerId1",
                table: "Departments",
                column: "ManagerId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
