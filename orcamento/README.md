# Orçamentos exclusivos por cliente

Cada cliente recebe um link único com uma proposta interativa: três formatos de preço,
adicionais opcionais com total calculado na hora, exclusões explícitas e condições.
Tudo estático — sem backend, sem build.

## Como criar uma proposta nova

1. Copie um modelo de `modelos/` (ensaio, evento, video ou mensal) para `clientes/`.
2. Renomeie com um token difícil de adivinhar: `nome-do-cliente-x9f2.json`
   (só letras minúsculas, números e hífen; o sufixo aleatório impede que alguém
   descubra a proposta de outro cliente chutando nomes).
3. Edite o JSON: nome, projeto, intro pessoal, datas, preços e itens.
4. Faça o deploy e mande o link:
   `https://SEU-DOMINIO/orcamento/?c=nome-do-cliente-x9f2`

Exemplo funcionando: `/orcamento/?c=exemplo-k7f2`

## Campos do JSON

| Campo | O que é |
|---|---|
| `cliente` | Nome exibido no título ("Para Fulano.") |
| `projeto` | Nome do projeto no cabeçalho e no e-mail de aceite |
| `data` / `validade` | ISO `AAAA-MM-DD`; proposta vencida mostra aviso (mas continua abrindo) |
| `intro` | Parágrafo pessoal de abertura |
| `sufixoPreco` | `""` para valor fechado, `"/mês"` para recorrente |
| `opcoes[]` | 1 a 3 formatos; `recomendado: true` ganha selo e vem pré-selecionado |
| `adicionais[]` | `tipo: "fixo"` (R$) ou `"percentual"` (% sobre o formato escolhido) |
| `naoIncluso[]` | Exclusões explícitas — evita atrito depois |
| `condicoes[]` | Pagamento, revisões, prazos, portfólio |
| `email` | Destino do botão "Aceitar proposta" |
| `whatsapp` | Opcional, ex. `"5531999999999"`; se existir, o aceite vai pro WhatsApp |

## Detalhes

- As propostas têm `noindex` (meta + header no `vercel.json`) e não são linkadas
  em lugar nenhum do site: só quem tem o link vê.
- A página imprime bem (Ctrl+P) — dá para gerar PDF da proposta para anexar.
- Preços dos modelos seguem pesquisa de mercado BH 2026, perfil freelancer:
  ensaios R$ 350–700 · eventos R$ 500–1.300 · institucional R$ 1.800–4.500 ·
  mensal R$ 1.200–2.500 (fidelidade 3 meses) · fim de semana +30–35% ·
  cessão total de direitos +30% · entrega expressa +25%.
