FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY backend/*.csproj ./
RUN dotnet restore --locked-mode 2>/dev/null || dotnet restore

COPY backend/ ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "backend.dll"]