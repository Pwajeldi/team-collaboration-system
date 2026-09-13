using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class GroupChatattachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isRead",
                table: "Messages",
                newName: "IsRead");

            migrationBuilder.RenameColumn(
                name: "isDelivered",
                table: "Messages",
                newName: "IsDelivered");

            migrationBuilder.AddColumn<long>(
                name: "DepartmentMessageId",
                table: "MessageAttachments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDelivered",
                table: "DepartmentMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "DepartmentMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_MessageAttachments_DepartmentMessageId",
                table: "MessageAttachments",
                column: "DepartmentMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageAttachments_DepartmentMessages_DepartmentMessageId",
                table: "MessageAttachments",
                column: "DepartmentMessageId",
                principalTable: "DepartmentMessages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageAttachments_DepartmentMessages_DepartmentMessageId",
                table: "MessageAttachments");

            migrationBuilder.DropIndex(
                name: "IX_MessageAttachments_DepartmentMessageId",
                table: "MessageAttachments");

            migrationBuilder.DropColumn(
                name: "DepartmentMessageId",
                table: "MessageAttachments");

            migrationBuilder.DropColumn(
                name: "IsDelivered",
                table: "DepartmentMessages");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "DepartmentMessages");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "Messages",
                newName: "isRead");

            migrationBuilder.RenameColumn(
                name: "IsDelivered",
                table: "Messages",
                newName: "isDelivered");
        }
    }
}
