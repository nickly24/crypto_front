import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  /**
   * После каждого деплоя у пользователей в кэше может остаться старый index.html со ссылками
   * на удалённые чанки — браузер получает 404 по JS и часто уходит в цикл полных перезагрузок.
   * Для static export заголовки задаёт serve через public/serve.json, который попадает в out/.
   */
};

export default nextConfig;
