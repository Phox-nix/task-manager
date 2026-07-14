FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY backend/*.csproj ./
RUN dotnet restore

COPY backend/ ./
RUN dotnet build -c Release --no-restore
RUN dotnet publish -c Release -o out --no-build

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "backend.dll"]