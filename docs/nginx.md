Curto e direto: **na sua VPS com um Nginx “da casa” já instalado fazendo o roteamento, na maioria dos casos *não* vale a pena enfiar outro Nginx dentro do repositório Docker**. Mantém tudo mais simples: cada app roda só o que precisa (API Node ou um servidor estático simples), e o **Nginx do host** faz TLS, HTTP/2, compressão, cache e roteamento.

# Quando **não** colocar Nginx no app

* Você já tem **Nginx no host** (outra camada de proxy seria redundante).
* A API é **Express/Node** e não precisa de regras HTTP avançadas.
* O front React pode ser servido **pelo Nginx do host** apontando para uma pasta/volume com o build.
* Você quer **logs, TLS, HSTS, CSP** centralizados num lugar só.

# Quando **faz sentido** ter um Nginx no container do app

* O app precisa de **regras HTTP específicas** que você não quer misturar no Nginx global (ex.: reescritas complexas, cache por caminho, throttling por rota).
* Você quer empacotar **um “web pronto”** (React estático + cabeçalhos + cache + SPA fallback) e rodar isso onde o host *não* tem Nginx (ex.: outro ambiente).
* Você precisa de **cache de assets/SSR** por aplicação, isolado.
* Multi-time/equipes: cada app mantém seu próprio Nginx sem pedir mudança no Nginx global.

> Regra prática: se o **host Nginx** já resolve o que você precisa, **não duplique**. Use Nginx no container apenas por requisito técnico claro.

---

## Setup recomendado (simples e robusto)

### 1) Nginx no **host** como único proxy

* **TLS/HTTP2/Certbot** no host.
* **SPDY/QUIC** (HTTP/3) se quiser.
* **HSTS, CSP, Referrer-Policy, Permissions-Policy** no host.
* **Reverse proxy** para os containers por domínio/subdomínio.

Exemplo (host Nginx) – API:

```nginx
server {
  listen 443 ssl http2;
  server_name api.suaapp.com;

  # TLS, HSTS etc aqui…

  # WebSocket + proxy padrões
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

Exemplo (host Nginx) – **frontend React estático** servido pelo host:

```nginx
server {
  listen 443 ssl http2;
  server_name app.suaapp.com;

  root /var/www/app/build;  # copie o build do React pra cá no deploy
  index index.html;

  # Cache forte para assets fingerprintados
  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    try_files $uri =404;
  }

  # SPA fallback
  location / {
    try_files $uri /index.html;
  }
}
```

No **Express**, habilite:

```ts
app.set('trust proxy', 1); // para ler X-Forwarded-Proto/IP corretamente
```

### 2) Onde rodar os containers

* `docker compose` expondo **somente portas internas** (localhost/bridge) e o Nginx do **host** acessa essas portas.
* Healthchecks no compose e no Nginx (se quiser).

---

## Se preferir “dobrar” Nginx (por app)

Tudo bem também — “duplo Nginx” não é crime, só é **mais uma camada**.
Nesse caso:

* **TLS só no host**; o Nginx do app fica **sem TLS**, atrás do host.
* Coloque no Nginx do app as regras específicas (cache, compressão, SPA fallback, range requests de vídeo, etc.).
* O host Nginx só faz o `proxy_pass` para `web:80` ou `api:5000`.

---

## Dúvidas comuns (bem resumidas)

* **CORS**: se o host proxyar `/api` e `/` no **mesmo domínio**, você quase não precisa de CORS.
* **Logs**: centralize no host (acessos) e use **Pino** na API para logs de app.
* **WebSockets**: lembre de `Upgrade`/`Connection` nos `proxy_set_header` (modelo acima).
* **HTTP/3**: ative só no host; containers seguem em HTTP/1.1/2 internamente.
* **React build**: ou o host serve estático (mais simples), ou você usa um **container web** (Nginx) por app — escolha 1, não precisa dos dois.

---

### Minha recomendação para o seu caso

* **Use só o Nginx do host.**
* API Node em container na porta interna `5000`.
* Front React: **build copiado para o host** e servido diretamente por ele, ou **um container web** (se quiser isolar deploy por app). Evite ter **Nginx no host + Nginx dentro do container** sem necessidade específica.

Se quiser, te mando um **pacote de arquivos** (server blocks do host, compose, Makefile de deploy) já no formato que você usa — é só dizer se vai servir o React pelo host ou por um container dedicado.
