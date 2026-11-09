# Arquitetura em camadas e S.O.L.I.D.

```
Rotas (routes/)  →  Services (services/)  →  Interfaces (domain/)  ←  Repositórios (repositories/)  →  PostgreSQL
 HTTP e validação     regras de negócio       contratos              implementação com TypeORM
```

| Princípio | Onde aparece no código |
|---|---|
| **S** — Responsabilidade única | `DispositivoService` só cuida de dispositivos; `RotinaService` só de rotinas; `validation.ts` só valida; `adminAuth.ts` só autentica; `horario.ts` só trata fuso e hora; as rotas só traduzem HTTP |
| **O** — Aberto/fechado | Novos tipos de dispositivo ou ambiente entram alterando apenas a lista em `validation.ts` (e os dicionários do NLU); novas rotas entram em arquivos novos sem mexer nos existentes |
| **L** — Substituição de Liskov | Qualquer classe que implemente `IDispositivoRepository`/`IHistoricoRepository` (TypeORM, em memória, MongoDB...) pode ser usada no lugar da outra sem mudar os services |
| **I** — Segregação de interfaces | Duas interfaces pequenas e separadas (dispositivos e histórico), em vez de uma interface única e gigante |
| **D** — Inversão de dependência | Os services recebem as interfaces pelo construtor; quem escolhe as implementações concretas é só o `container.ts` (raiz de composição) |

**Exemplo para a banca:** "Se amanhã quisermos trocar o PostgreSQL por MongoDB, criamos dois repositórios novos e trocamos duas linhas no `container.ts`. Os services, as rotas e o assistente não mudam."
