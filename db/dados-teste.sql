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
  VALUES ('Caixa 7 PH', 'PH', 'Warehouse Teste', 'brasil', now() - interval '12 days', current_date - 45, 'Observação teste')
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
  VALUES (caixa1, 'set', 'otw', now() - interval '8 days',
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
  VALUES (caixa1, 'individual', 'otw', now() - interval '9 days',
    'Item Teste com um nome enorme para ver as reticências funcionando no card', 'Grupo Teste', 2, 2, 50.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 52.40, 7.80, 4.20, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '15 days', 'Item Teste Três', 'Grupo Teste', 1, 1, 20.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, eu, 'Membro Teste', 22.00, NULL, NULL, true, false, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '1 day', 'Item Teste de Outra Pessoa', 'Grupo Teste', 1, 1, 25.00)
  RETURNING id INTO item;
  INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  VALUES (item, outra1, 'Membro Teste', 30.00, 5.00, 3.00, true, true, false);

  INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
  VALUES (caixa1, 'individual', 'otw', now() - interval '10 days',
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

-- === Seção: Itens sem dono de teste ===
-- Cada item fica numa caixa com etapa que combina com a dele (warehouse, OTW ou No Brasil).
INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, membro, qtd_pc, qtd_itens, sem_dono, preco_sem_dono)
SELECT c.id, 'individual', v.situacao::situacao, now() - interval '2 days', v.nome, v.grupo, v.membro, 1, 1, true, v.preco
FROM (VALUES
  ('Caixa 12 KR', 'to us hanjin compact version', 'TWS', 'Hanjin', 'warehouse', 25.00),
  ('Caixa 12 KR', 'supernova giselle lucky draw', 'aespa', 'Giselle', 'comprado', 38.00),
  ('Caixa 12 KR', 'hot sauce jaemin pob', 'NCT DREAM', 'Jaemin', 'esperando', 29.90),
  ('Caixa 4 JP', 'velvet summer lucky draw', 'Red Velvet', 'Irene', 'otw', 31.00),
  ('Caixa 4 JP', 'lemonade karina lucky draw com um nome bem comprido', 'aespa', 'Karina', 'otw', 45.00),
  ('Caixa 7 PH', 'made my night compact', 'LE SSERAFIM', 'Eunchae', 'brasil', 35.00),
  ('Caixa 7 PH', 'item sem dono sete', 'Grupo Teste', 'Membro Teste', 'brasil', 18.50)
) AS v(caixa, nome, grupo, membro, situacao, preco)
JOIN caixa c ON c.nome = v.caixa AND c.observacao = 'Observação teste'
WHERE NOT EXISTS (SELECT 1 FROM registro r WHERE r.caixa_id = c.id AND r.nome = v.nome AND r.sem_dono);

-- === Seção: Caixas na casa da GOM (Casa da GOM e painel) ===
-- "Caixa 2 JP" recebe a proof do joiner de teste; "Caixa 9 KR" fica sem foto ("Foto em breve").
-- As outras pessoas ficam sem proof, para aparecerem em "Proofs para subir" no painel.
DO $$
DECLARE
  eu text := (SELECT id FROM "user" WHERE username = 'tonddoii');
  outra1 text := (SELECT id FROM "user" WHERE username = 'jellisyujeu');
  outra2 text := (SELECT id FROM "user" WHERE username = 'geowooo');
  caixa_com_foto int;
  caixa_sem_foto int;
  linha record;
  item int;
BEGIN
  IF EXISTS (SELECT 1 FROM caixa WHERE nome = 'Caixa 2 JP' AND observacao = 'Observação teste') THEN
    RETURN;
  END IF;

  INSERT INTO caixa (nome, origem, warehouse, situacao, situacao_atualizada_em, abertura, observacao, criada_em)
  VALUES ('Caixa 2 JP', 'JP', 'Warehouse Teste', 'casa_gom', now() - interval '3 days', current_date - 70, 'Observação teste', now() - interval '70 days')
  RETURNING id INTO caixa_com_foto;

  INSERT INTO caixa (nome, origem, warehouse, situacao, situacao_atualizada_em, abertura, observacao, criada_em)
  VALUES ('Caixa 9 KR', 'KR', 'Warehouse Teste', 'casa_gom', now() - interval '6 days', current_date - 90, 'Observação teste', now() - interval '90 days')
  RETURNING id INTO caixa_sem_foto;

  FOR linha IN
    SELECT * FROM (VALUES
      (caixa_com_foto, eu, 'tws dohoon last bell', 'TWS', 'Dohoon', 22.00, 5.00, 3.50, true, true, true),
      (caixa_com_foto, eu, 'harua mom showcase', '&TEAM', 'Harua', 38.11, 6.00, 3.00, true, true, false),
      (caixa_com_foto, eu, 'harua mom set', '&TEAM', 'Harua', 25.00, 4.00, 2.50, true, true, true),
      (caixa_com_foto, eu, 'harua mom units 7-set', '&TEAM', 'Harua', 31.00, 4.50, 2.00, true, false, false),
      (caixa_com_foto, eu, 'k mom pob ktown4u', '&TEAM', 'K', 18.00, 3.00, 1.50, true, true, true),
      (caixa_com_foto, eu, 'nicholas mom lucky draw', '&TEAM', 'Nicholas', 27.00, 4.00, 2.00, true, true, true),
      (caixa_com_foto, outra1, 'yuma mom showcase', '&TEAM', 'Yuma', 38.11, 6.00, 3.00, true, true, true),
      (caixa_com_foto, outra2, 'jo mom set', '&TEAM', 'Jo', 25.00, 4.00, 2.50, true, true, false),
      (caixa_sem_foto, eu, 'karina whiplash pob', 'aespa', 'Karina', 29.90, 5.00, 4.00, true, true, false),
      (caixa_sem_foto, eu, 'winter dirty work lucky draw', 'aespa', 'Winter', 33.00, 5.00, 4.00, true, true, true),
      (caixa_sem_foto, outra1, 'ningning whiplash pob', 'aespa', 'Ningning', 29.90, 5.00, 4.00, true, false, false)
    ) AS v(caixa_id, user_id, nome, grupo, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
  LOOP
    INSERT INTO registro (caixa_id, tipo, situacao, situacao_atualizada_em, nome, grupo, qtd_pc, qtd_itens, compra)
    VALUES (linha.caixa_id, 'individual', 'casa_gom', now() - interval '2 days', linha.nome, linha.grupo, 1, 1, linha.venda - 5)
    RETURNING id INTO item;

    INSERT INTO parte (registro_id, user_id, membro, venda, inter, taxa, venda_pago, inter_pago, taxa_pago)
    VALUES (item, linha.user_id, linha.membro, linha.venda, linha.inter, linha.taxa, linha.venda_pago, linha.inter_pago, linha.taxa_pago);
  END LOOP;
END $$;

-- Proof da Caixa 2 JP para o joiner de teste (a foto fica no Cloudinary em testes/proof-exemplo)
INSERT INTO proof_gom (caixa_id, user_id, foto_id, criada_em)
SELECT c.id, u.id, 'testes/proof-exemplo', now() - interval '2 days'
FROM caixa c, "user" u
WHERE c.nome = 'Caixa 2 JP' AND c.observacao = 'Observação teste' AND u.username = 'tonddoii'
ON CONFLICT (caixa_id, user_id) DO NOTHING;

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
-- Rode só estas três linhas quando quiser limpar (as partes saem junto com os itens):
-- DELETE FROM registro WHERE caixa_id IN (SELECT id FROM caixa WHERE observacao = 'Observação teste');
-- DELETE FROM proof_gom WHERE caixa_id IN (SELECT id FROM caixa WHERE observacao = 'Observação teste');
-- DELETE FROM caixa WHERE observacao = 'Observação teste';
