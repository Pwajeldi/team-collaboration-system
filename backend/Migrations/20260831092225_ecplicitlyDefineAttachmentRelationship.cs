using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ecplicitlyDefineAttachmentRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageAttachments_Messages_MessagesId",
                table: "MessageAttachments");

            migrationBuilder.DropIndex(
                name: "IX_MessageAttachments_MessagesId",
                table: "MessageAttachments");

            migrationBuilder.DropColumn(
                name: "MessagesId",
                table: "MessageAttachments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "MessagesId",
                table: "MessageAttachments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MessageAttachments_MessagesId",
                table: "MessageAttachments",
                column: "MessagesId");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageAttachments_Messages_MessagesId",
                table: "MessageAttachments",
                column: "MessagesId",
                principalTable: "Messages",
                principalColumn: "Id");
        }
    }
}
