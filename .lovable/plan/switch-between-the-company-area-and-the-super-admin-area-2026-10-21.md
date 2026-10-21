# Switch between the company area and the Super Admin area

## What you will see
- **In the company menu** (left side of /app pages): a "Painel Super Admin" button with a shield icon, just above "Sair". It shows **only** for Super Administrator accounts. Clicking it opens /master/painel.
- **In the Super Admin menu** (/master pages): a "Voltar para Empresa" button above "Sair" that opens the company dashboard (/app/dashboard).
- **In the red top bar** of the master pages: the same "Voltar para Empresa" link, for quick access.
- If the Super Admin has no company linked, "Voltar para Empresa" opens the company setup screen (current behavior of /app).

## Security
- The button only appears when the account has the Super Admin role saved in the database (the same check the master pages already use).
- The /master pages keep blocking every non-Super Admin account, even if someone types the address directly.

## Technical details
- `src/components/sidebar-tenant.tsx`: in the footer, render a `SidebarMenuButton asChild` with `<Link to="/master/painel">` (Shield icon) when `tenant?.isSuperAdmin`.
- `src/components/sidebar-master.tsx`: add a footer `<Link to="/app/dashboard">` "Voltar para Empresa" (ArrowLeft/Building2 icon).
- `src/routes/master.tsx`: add the "Voltar para Empresa" link on the right side of the header.
- No database changes.
