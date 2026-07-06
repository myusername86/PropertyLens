FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/ArvSaas.Domain/ArvSaas.Domain.csproj", "src/ArvSaas.Domain/"]
COPY ["src/ArvSaas.Application/ArvSaas.Application.csproj", "src/ArvSaas.Application/"]
COPY ["src/ArvSaas.Infrastructure/ArvSaas.Infrastructure.csproj", "src/ArvSaas.Infrastructure/"]
COPY ["src/ArvSaas.Api/ArvSaas.Api.csproj", "src/ArvSaas.Api/"]
RUN dotnet restore "src/ArvSaas.Api/ArvSaas.Api.csproj"
COPY . .
RUN dotnet publish "src/ArvSaas.Api/ArvSaas.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ArvSaas.Api.dll"]
