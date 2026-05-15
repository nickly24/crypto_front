import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    const noStoreHeaders = [
      { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
      { key: "Pragma", value: "no-cache" },
      { key: "Expires", value: "0" },
      { key: "Surrogate-Control", value: "no-store" },
    ];

    return [
      {
        source: "/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/_next/:path*",
        headers: noStoreHeaders,
      },
    ];
  },
  /**
   * После каждого деплоя у пользователей в кэше может остаться старый index.html со ссылками
   * на удалённые чанки — браузер получает 404 по JS и часто уходит в цикл полных перезагрузок.
   * Ниже принудительно отключаем кэш и для HTML, и для next-ассетов на стороне приложения,
   * чтобы клиент не держал старые версии чанков между релизами.
   */
};

export default nextConfig;
