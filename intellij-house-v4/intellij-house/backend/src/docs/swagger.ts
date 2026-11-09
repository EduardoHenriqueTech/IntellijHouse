/**
 * swagger.ts
 * Documentação OpenAPI 3 da API. Abra http://localhost:3000/docs para ver e testar as rotas.
 */
const ref = (n: string) => ({ $ref: `#/components/schemas/${n}` });
const json = (schema: object) => ({ "application/json": { schema } });
const erro = (descricao: string) => ({ description: descricao, content: json(ref("Erro")) });
const idParam = { name: "id", in: "path", required: true, schema: { type: "integer" } };
const admin = [{ AdminToken: [] }];

export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Intellij House API",
    version: "2.0.0",
    description:
      "API da Casa Inteligente (projeto ADS - 4º semestre). Controla dispositivos simulados, conversa com o " +
      "assistente virtual (NLU em Python) e expõe as rotinas aprendidas por Machine Learning.\n\n" +
      "Rotas marcadas com cadeado exigem o cabeçalho `x-admin-token` quando a variável ADMIN_TOKEN está definida.",
  },
  tags: [
    { name: "Dispositivos", description: "CRUD e controle dos dispositivos" },
    { name: "Assistente", description: "Chatbot com NLU (intenção + entidades)" },
    { name: "Rotina", description: "Histórico e aprendizado de rotina (ML)" },
    { name: "Sistema" },
  ],
  components: {
    securitySchemes: { AdminToken: { type: "apiKey", in: "header", name: "x-admin-token" } },
    schemas: {
      Erro: { type: "object", properties: { erro: { type: "string" } } },
      Dispositivo: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 }, nome: { type: "string", example: "Luz da sala" },
          tipo: { type: "string", enum: ["luz", "ventilador", "ar_condicionado", "tv"] },
          ambiente: { type: "string", enum: ["sala", "quarto", "cozinha", "banheiro", "escritorio"] },
          ligado: { type: "boolean" },
        },
      },
      DispositivoEntrada: {
        type: "object", required: ["nome", "tipo", "ambiente"],
        properties: {
          nome: { type: "string", example: "Luz do escritório" },
          tipo: { type: "string", enum: ["luz", "ventilador", "ar_condicionado", "tv"] },
          ambiente: { type: "string", enum: ["sala", "quarto", "cozinha", "banheiro", "escritorio"] },
          ligado: { type: "boolean", default: false },
        },
      },
      Interpretacao: {
        type: "object",
        properties: {
          mensagem: { type: "string" }, intencao: { type: "string", example: "desligar_dispositivo" },
          confianca: { type: "number", example: 0.93 },
          dispositivo: { type: "string", nullable: true }, ambiente: { type: "string", nullable: true },
        },
      },
      Rotina: {
        type: "object",
        properties: {
          dispositivo_id: { type: "integer" }, dispositivo_nome: { type: "string" },
          acao: { type: "string", enum: ["ligar", "desligar"] }, horario: { type: "string", example: "23:05" },
          ocorrencias: { type: "integer" }, dispersao_min: { type: "integer" }, consistencia: { type: "number" },
          mensagem: { type: "string" }, sugerirAgora: { type: "boolean" },
        },
      },
      Historico: {
        type: "object",
        properties: {
          id: { type: "integer" }, dispositivoId: { type: "integer" }, dispositivoNome: { type: "string" },
          acao: { type: "string" }, origem: { type: "string", enum: ["painel", "assistente", "simulado"] },
          minutoDoDia: { type: "integer" }, criadoEm: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/dispositivos": {
      get: {
        tags: ["Dispositivos"], summary: "Lista dispositivos (com filtros e ordenação)",
        parameters: [
          { name: "tipo", in: "query", schema: { type: "string" } },
          { name: "ambiente", in: "query", schema: { type: "string" } },
          { name: "ordenar", in: "query", schema: { type: "string", enum: ["nome", "tipo", "ambiente", "ligado", "id"] } },
          { name: "ordem", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: { 200: { description: "Lista", content: json({ type: "array", items: ref("Dispositivo") }) } },
      },
      post: {
        tags: ["Dispositivos"], summary: "Cria um dispositivo", security: admin,
        requestBody: { required: true, content: json(ref("DispositivoEntrada")) },
        responses: { 201: { description: "Criado", content: json(ref("Dispositivo")) }, 400: erro("Dados inválidos"), 401: erro("Sem permissão"), 409: erro("Já existe esse tipo no ambiente") },
      },
    },
    "/dispositivos/{id}": {
      get: { tags: ["Dispositivos"], summary: "Mostra um dispositivo", parameters: [idParam], responses: { 200: { description: "OK", content: json(ref("Dispositivo")) }, 404: erro("Não encontrado") } },
      put: {
        tags: ["Dispositivos"], summary: "Substitui um dispositivo (todos os campos)", security: admin, parameters: [idParam],
        requestBody: { required: true, content: json(ref("DispositivoEntrada")) },
        responses: { 200: { description: "Atualizado", content: json(ref("Dispositivo")) }, 400: erro("Dados inválidos"), 401: erro("Sem permissão"), 404: erro("Não encontrado"), 409: erro("Conflito") },
      },
      patch: {
        tags: ["Dispositivos"], summary: "Altera alguns campos", security: admin, parameters: [idParam],
        requestBody: { required: true, content: json(ref("DispositivoEntrada")) },
        responses: { 200: { description: "Atualizado", content: json(ref("Dispositivo")) }, 400: erro("Dados inválidos"), 401: erro("Sem permissão"), 404: erro("Não encontrado"), 409: erro("Conflito") },
      },
      delete: { tags: ["Dispositivos"], summary: "Exclui um dispositivo", security: admin, parameters: [idParam], responses: { 204: { description: "Excluído" }, 401: erro("Sem permissão"), 404: erro("Não encontrado") } },
    },
    "/dispositivos/{id}/ligar": { post: { tags: ["Dispositivos"], summary: "Liga o dispositivo", parameters: [idParam], responses: { 200: { description: "OK", content: json(ref("Dispositivo")) }, 404: erro("Não encontrado") } } },
    "/dispositivos/{id}/desligar": { post: { tags: ["Dispositivos"], summary: "Desliga o dispositivo", parameters: [idParam], responses: { 200: { description: "OK", content: json(ref("Dispositivo")) }, 404: erro("Não encontrado") } } },
    "/assistente/mensagem": {
      post: {
        tags: ["Assistente"], summary: "Envia uma frase ao assistente virtual",
        requestBody: { required: true, content: json({ type: "object", required: ["mensagem"], properties: { mensagem: { type: "string", example: "Apague a luz da sala" } } }) },
        responses: {
          200: { description: "Resposta e interpretação do NLU", content: json({ type: "object", properties: { resposta: { type: "string" }, interpretacao: ref("Interpretacao") } }) },
          400: erro("Mensagem vazia"), 503: erro("Serviço Python indisponível"),
        },
      },
    },
    "/rotina": { get: { tags: ["Rotina"], summary: "Rotinas aprendidas pelo ML + sugestões para agora", responses: { 200: { description: "OK", content: json({ type: "object", properties: { analisados: { type: "integer" }, rotinas: { type: "array", items: ref("Rotina") } } }) }, 503: erro("Serviço Python indisponível") } } },
    "/historico": {
      get: { tags: ["Rotina"], summary: "Últimos comandos registrados", parameters: [{ name: "limite", in: "query", schema: { type: "integer", default: 50 } }], responses: { 200: { description: "OK", content: json({ type: "array", items: ref("Historico") }) } } },
      delete: { tags: ["Rotina"], summary: "Apaga o histórico de uma origem", security: admin, parameters: [{ name: "origem", in: "query", required: true, schema: { type: "string", enum: ["simulado", "painel", "assistente"] } }], responses: { 200: { description: "Quantidade apagada" }, 401: erro("Sem permissão") } },
    },
    "/saude": { get: { tags: ["Sistema"], summary: "Confere se a API e o banco estão no ar", responses: { 200: { description: "OK" }, 503: { description: "Banco indisponível" } } } },
  },
};
