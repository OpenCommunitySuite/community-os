FROM node:24.22.1-bookworm-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS frontend
WORKDIR /src
COPY src/CommunityOS.PlatformApp/package.json src/CommunityOS.PlatformApp/pnpm-lock.yaml src/CommunityOS.PlatformApp/pnpm-workspace.yaml ./
RUN npx --yes pnpm@11.25.0 install --frozen-lockfile
COPY src/CommunityOS.PlatformApp/ ./
RUN npx --yes pnpm@11.25.0 build

FROM mcr.microsoft.com/dotnet/sdk:10.0.401@sha256:e70cdb7f80b0348f5cb85f19a8f670fca061f033d57eed12fa003d58b0e06317 AS backend
WORKDIR /src
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/ ./src/
RUN dotnet restore src/CommunityOS.Web --locked-mode && dotnet restore src/CommunityOS.Worker --locked-mode
RUN dotnet publish src/CommunityOS.Web -c Release --no-restore -o /out/web && \
    dotnet publish src/CommunityOS.Worker -c Release --no-restore -o /out/worker

FROM mcr.microsoft.com/dotnet/aspnet:10.0.12@sha256:222759b391a1aaf241166672c8f99b2d4ada452e7b5319f3c6e8f265a37b5ad4
WORKDIR /app
RUN mkdir -p /state /run/stand && chown -R "$APP_UID" /state /run/stand
COPY --from=backend /out/web ./web
COPY --from=backend /out/worker ./worker
COPY --from=frontend /src/dist ./platform
ENV Platform__FrontendDirectory=/app/platform HOME=/state
USER $APP_UID
ENTRYPOINT ["dotnet"]
CMD ["/app/web/CommunityOS.Web.dll"]
