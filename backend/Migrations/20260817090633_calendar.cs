using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class calendar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TeamMemberId",
                table: "Events",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_TeamMemberId",
                table: "Events",
                column: "TeamMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_TeamMemberId",
                table: "Events",
                column: "TeamMemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_TeamMemberId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_TeamMemberId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "TeamMemberId",
                table: "Events");
        }
    }
}
