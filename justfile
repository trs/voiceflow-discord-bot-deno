cache:
  deno cache --import-map import_map.json src/main.ts

run:
  deno run --allow-env --allow-read --allow-net --import-map import_map.json src/main.ts
