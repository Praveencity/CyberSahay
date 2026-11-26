export default {
  poweredByHeader: false,
  allowedDevOrigins: ["localhost", "127.0.0.1", "[::1]"],
  serverExternalPackages: ["playwright"],
  outputFileTracingIncludes: {
    "/api/complaints/*/pdf": ["./public/fonts/*.ttf"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
