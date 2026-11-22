-- === Seção: Dados de teste da Tela de Caixas ===
-- Cria 3 caixas de teste (marcadas com a observação 'Observação teste') com sets e pedidos individuais.
-- Partes do joiner: venda e inter pagos, taxa pendente.
-- Para apagar tudo depois, rode o bloco "Apagar dados de teste" no fim do arquivo.

DO $$
DECLARE
  -- Troque aqui o @ de quem vai testar (sem o @) e de duas outras pessoas
  eu text := (SELECT id FROM "user" WHERE username = 'tonddoii');
  outra1 text := (SELECT id FROM "user" WHERE username = 'jellisyujeu');
  outra2 text := (SELECT id FROM "user" WHERE username = 'geowooo');
  caixa1 int;
  caixa2 int;
  caixa3 int;
  item int;
BEGIN
  IF eu IS NULL OR outra1 IS NULL OR outra2 IS NULL THEN
    RAISE EXCEPTION 'Algum dos usuários não existe. Confira os @ no começo do script.';
  END IF;

  -- === Seção: Caixas ===
  INSERT INTO caixa (nome, origem, warehouse, situacao, situacao_atualizada_em, abertura, observacao)
  VALUES ('Caixa 4 JP', 'JP', 'Warehouse Teste', 'otw', now() - interval '1 day', current_date - 30, 'Observação teste')
  RETURNING id INTO caixa1;

  INSERT INTO caixa (nome, origem, warehouse, situacao, situacao_atualizada_em, abertura, observacao)
  VALUES ('Caixa 12 KR', 'KR', 'Warehouse Teste com Nome Longo', 'warehouse', now() - interval '6 days', current_date - 20, 'Observação teste')
  RETURNING id INTO caixa2;

  INSERT INTO caixa (nome, origem, warehouse, situacao, situacao_atualizada_em, abertura, observacao)
  VALUES ('Caixa 7 PH', 'PH', 'Warehouse Teste', 'esperando_taxa', now() - interval '12 days', current_date - 45, 'Observação teste')
  RETURNING id INTO caixa3;

  -- === Seção: Sets da Caixa 4 JP (divididos entre várias pessoas) ===
  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, peso_kg, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'set', 'otw', now() - interval '1 day',
    'Set Teste com um nome muito muito longo para testar as reticências do cartão', 'Grupo Teste', 0.250, 5, 5, 100.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago) VALUES
    (item, eu, 'Ver. 1', 25.90, 4.50, 3.00, true, true, false),
    (item, eu, 'Ver. 2', 25.90, 4.50, 3.00, true, true, false),
    (item, outra1, 'Ver. 3', 25.90, 4.50, 3.00, true, true, false),
    (item, outra2, 'Ver. 4', 25.90, 4.50, 3.00, true, true, false),
    (item, outra2, 'Ver. 5', 25.90, 4.50, 3.00, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, peso_kg, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'set', 'warehouse', now() - interval '8 days',
    'Set Teste', 'Grupo Teste com um Nome Longo Demais', 0.120, 3, 3, 60.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago) VALUES
    (item, outra1, 'Membro Teste', 19.00, 3.20, 2.10, true, true, false),
    (item, outra2, 'Membro Teste com Nome Longo', 19.00, 3.20, 2.10, true, true, false),
    (item, eu, 'Membro Teste', 19.00, 3.20, 2.10, true, true, false);

  -- === Seção: Pedidos individuais da Caixa 4 JP ===
  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '1 day', 'Item Teste', 'Grupo Teste', 1, 1, 30.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 38.11, 6.00, 3.00, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'comprado', now() - interval '9 days',
    'Item Teste com um nome enorme para ver as reticências funcionando no card', 'Grupo Teste', 2, 2, 50.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 52.40, 7.80, 4.20, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'esperando', now() - interval '15 days', 'Item Teste Três', 'Grupo Teste', 1, 1, 20.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 22.00, NULL, NULL, true, false, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '1 day', 'Item Teste de Outra Pessoa', 'Grupo Teste', 1, 1, 25.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, outra1, 'Membro Teste', 30.00, 5.00, 3.00, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'warehouse', now() - interval '10 days',
    'Item Teste com um nome muito longo de outra pessoa para testar', 'Grupo Teste', 3, 3, 40.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, outra2, 'Membro Teste', 45.00, 6.00, 3.50, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '10 days', 'Item Teste Seis', 'Grupo Teste', 1, 1, 18.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, outra1, 'Membro Teste', 21.00, 3.00, 2.00, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '10 days', 'Item Teste Sete', 'Grupo Teste', 1, 1, 18.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, outra2, 'Membro Teste', 21.00, 3.00, 2.00, true, true, false);

  -- === Seção: Itens das outras caixas (para aparecerem em "Suas caixas") ===
  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa2, 'individual', 'warehouse', now() - interval '6 days', 'Item Teste KR', 'Grupo Teste', 2, 2, 35.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 40.00, 6.00, 3.00, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa3, 'individual', 'brasil', now() - interval '12 days', 'Item Teste PH', 'Grupo Teste', 1, 1, 28.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 33.00, 5.00, 2.50, true, true, false);
END $$;

-- === Seção: Datas das etapas dos itens de teste ===
-- Cria uma data para cada etapa já percorrida, 9 dias antes da seguinte (a última é a mudança atual).
-- Pode rodar sozinho depois do "npx drizzle-kit push" que cria a tabela historico_etapa.
INSERT INTO historico_etapa (registro_id, situacao, data)
SELECT r.id, e.etapa, r.situacao_atualizada_em - (array_position(enum_range(NULL::situacao), r.situacao) - e.ordem) * interval '9 days'
FROM registro r
JOIN caixa c ON c.id = r.caixa_id AND c.observacao = 'Observação teste'
CROSS JOIN LATERAL unnest(enum_range(NULL::situacao)) WITH ORDINALITY AS e(etapa, ordem)
WHERE e.ordem <= array_position(enum_range(NULL::situacao), r.situacao)
  AND NOT EXISTS (SELECT 1 FROM historico_etapa h WHERE h.registro_id = r.id);

-- === Seção: Apagar dados de teste ===
-- Rode só estas duas linhas quando quiser limpar (as partes saem junto com os itens):
-- DELETE FROM registro WHERE caixa_id IN (SELECT id FROM caixa WHERE observacao = 'Observação teste');
-- DELETE FROM caixa WHERE observacao = 'Observação teste';
