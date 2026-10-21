# Trocar a logo GymBoss AI pela logo Gym Hub

## O que muda
- **Menu lateral da empresa (/app):** sai o ícone de halteres e o texto "GymBoss AI".
  - Menu aberto: logo completa "GymHub" (logo-gym-hub), com o nome da academia logo abaixo, em letra pequena.
  - Menu fechado: só o ícone laranja (logo-gym-hub-2).
- **Menu lateral do Super Admin (/master):** mesma troca (logo completa aberto, ícone fechado). A logo completa tem letras brancas, então o topo desse menu ganha um fundo escuro para ela aparecer bem. O texto "Master · Super admin" continua abaixo.
- **Ícone da aba do navegador:** passa a ser o ícone laranja do Gym Hub.

## Fora do escopo
- O nome "GymBoss AI" nos textos do site (página inicial, títulos das páginas) continua igual. Posso trocar para "Gym Hub" depois, se quiser.

## Detalhes técnicos
- Subir as duas imagens como assets CDN (`src/assets/logo-gym-hub.png.asset.json`, `logo-gym-hub-2.png.asset.json`).
- `sidebar-tenant.tsx` e `sidebar-master.tsx`: usar `useSidebar().state` para alternar entre a logo completa e o ícone; remover `Dumbbell`/`Shield` do cabeçalho.
- Favicon: `magick` do ícone para `public/favicon.png` 64x64, atualizar `head().links` em `__root.tsx`, remover `public/favicon.ico`.
