using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArvSaas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiInsightDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiNegotiationAdvice",
                table: "Deals",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiRisks",
                table: "Deals",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiStrengths",
                table: "Deals",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiNegotiationAdvice",
                table: "Deals");

            migrationBuilder.DropColumn(
                name: "AiRisks",
                table: "Deals");

            migrationBuilder.DropColumn(
                name: "AiStrengths",
                table: "Deals");
        }
    }
}
