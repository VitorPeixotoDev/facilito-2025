-- Scale options FiveMind (5 itens)
INSERT INTO assessment_scale_options (assessment_id, value, label, emoji, description, sort_order)
SELECT 'five-mind', v, l, e, NULL, v FROM (VALUES
    (1, 'Discordo totalmente', '🙅'),
    (2, 'Discordo', '👎'),
    (3, 'Neutro', '😐'),
    (4, 'Concordo', '👍'),
    (5, 'Concordo totalmente', '💯')
) AS t(v, l, e)
ON CONFLICT (assessment_id, value) DO NOTHING;

-- Scale options HexaMind (5 itens)
INSERT INTO assessment_scale_options (assessment_id, value, label, emoji, description, sort_order)
SELECT 'hexa-mind', v, l, e, d, v FROM (VALUES
    (1, 'Discordo totalmente', '🙅', 'Não se aplica a mim'),
    (2, 'Discordo', '👎', 'Raramente se aplica'),
    (3, 'Neutro', '😐', 'Às vezes se aplica'),
    (4, 'Concordo', '👍', 'Frequentemente se aplica'),
    (5, 'Concordo totalmente', '💯', 'Sempre se aplica')
) AS t(v, l, e, d)
ON CONFLICT (assessment_id, value) DO NOTHING;

-- FiveMind questions (20)
INSERT INTO assessment_questions (assessment_id, sort_order, text, factor, reverse_score) VALUES
('five-mind', 1, 'Tenho uma imaginação vívida', 'openness', false),
('five-mind', 2, 'Tenho pouco interesse em ideias abstratas', 'openness', true),
('five-mind', 3, 'Não sou uma pessoa criativa', 'openness', true),
('five-mind', 4, 'Tenho facilidade para entender ideias complexas', 'openness', false),
('five-mind', 5, 'Sou sempre preparado', 'conscientiousness', false),
('five-mind', 6, 'Deixo minhas coisas espalhadas', 'conscientiousness', true),
('five-mind', 7, 'Presto atenção aos detalhes', 'conscientiousness', false),
('five-mind', 8, 'Esqueço de devolver as coisas ao lugar', 'conscientiousness', true),
('five-mind', 9, 'Sou a vida da festa', 'extraversion', false),
('five-mind', 10, 'Não falo muito', 'extraversion', true),
('five-mind', 11, 'Sinto-me confortável com as pessoas', 'extraversion', false),
('five-mind', 12, 'Mantenho-me em segundo plano', 'extraversion', true),
('five-mind', 13, 'Interesso-me pelas pessoas', 'agreeableness', false),
('five-mind', 14, 'Sinto pouco interesse pelos outros', 'agreeableness', true),
('five-mind', 15, 'Tenho um coração mole', 'agreeableness', false),
('five-mind', 16, 'Não estou interessado nos problemas dos outros', 'agreeableness', true),
('five-mind', 17, 'Fico estressado facilmente', 'neuroticism', false),
('five-mind', 18, 'Raramente fico triste', 'neuroticism', true),
('five-mind', 19, 'Preocupo-me com as coisas', 'neuroticism', false),
('five-mind', 20, 'Sou relaxado na maior parte do tempo', 'neuroticism', true)
ON CONFLICT (assessment_id, sort_order) DO NOTHING;

-- HexaMind questions (40)
INSERT INTO assessment_questions (assessment_id, sort_order, text, factor, reverse_score) VALUES
('hexa-mind', 1, 'Procuro agir com integridade, mesmo quando ninguém está observando.', 'honesty', false),
('hexa-mind', 2, 'Evito tirar vantagem de situações, mesmo quando seria fácil.', 'honesty', false),
('hexa-mind', 3, 'Prefiro ser reconhecido pelo meu trabalho, não por autopromoção.', 'honesty', false),
('hexa-mind', 4, 'Acredito que honestidade é mais importante do que resultados imediatos.', 'honesty', false),
('hexa-mind', 5, 'Sou humilde ao falar sobre minhas conquistas.', 'honesty', false),
('hexa-mind', 6, 'Evito manipular pessoas para obter o que desejo.', 'honesty', false),
('hexa-mind', 7, 'Mantenho a calma mesmo sob forte pressão.', 'emotional_stability', false),
('hexa-mind', 8, 'Lido bem com críticas, mesmo quando são duras.', 'emotional_stability', false),
('hexa-mind', 9, 'Não costumo me abalar facilmente por contratempos.', 'emotional_stability', false),
('hexa-mind', 10, 'Costumo me recuperar rapidamente após frustrações.', 'emotional_stability', false),
('hexa-mind', 11, 'Me sinto seguro ao lidar com mudanças inesperadas.', 'emotional_stability', false),
('hexa-mind', 12, 'Raramente deixo a ansiedade me impedir de agir.', 'emotional_stability', false),
('hexa-mind', 13, 'Gosto de conhecer e conversar com pessoas novas.', 'extraversion', false),
('hexa-mind', 14, 'Costumo assumir o papel de liderança quando necessário.', 'extraversion', false),
('hexa-mind', 15, 'Transmito energia positiva no ambiente de trabalho.', 'extraversion', false),
('hexa-mind', 16, 'Tomo iniciativa em situações sociais ou coletivas.', 'extraversion', false),
('hexa-mind', 17, 'Me sinto confortável sendo o centro das atenções.', 'extraversion', false),
('hexa-mind', 18, 'Tenho facilidade para me expressar verbalmente.', 'extraversion', false),
('hexa-mind', 19, 'Busco ouvir atentamente a opinião das pessoas.', 'agreeableness', false),
('hexa-mind', 20, 'Costumo agir de forma paciente, mesmo sob tensão.', 'agreeableness', false),
('hexa-mind', 21, 'Evito conflitos desnecessários.', 'agreeableness', false),
('hexa-mind', 22, 'Acredito que gentileza ajuda a resolver problemas.', 'agreeableness', false),
('hexa-mind', 23, 'Sou colaborativo em equipes de diferentes perfis.', 'agreeableness', false),
('hexa-mind', 24, 'Procuro compreender o ponto de vista dos outros antes de julgar.', 'agreeableness', false),
('hexa-mind', 25, 'Gosto de cumprir metas e prazos com consistência.', 'conscientiousness', false),
('hexa-mind', 26, 'Me esforço para entregar meu trabalho da melhor forma possível.', 'conscientiousness', false),
('hexa-mind', 27, 'Sou organizado com minhas tarefas e compromissos.', 'conscientiousness', false),
('hexa-mind', 28, 'Planejo minhas atividades antes de executá-las.', 'conscientiousness', false),
('hexa-mind', 29, 'Evito procrastinar sempre que posso.', 'conscientiousness', false),
('hexa-mind', 30, 'Tenho disciplina para concluir tarefas mesmo quando são difíceis.', 'conscientiousness', false),
('hexa-mind', 31, 'Gosto de aprender coisas novas constantemente.', 'openness', false),
('hexa-mind', 32, 'Tenho facilidade para gerar novas ideias.', 'openness', false),
('hexa-mind', 33, 'Aprecio explorar abordagens diferentes para resolver problemas.', 'openness', false),
('hexa-mind', 34, 'Me interesso por assuntos fora da minha área habitual.', 'openness', false),
('hexa-mind', 35, 'Gosto de imaginar possibilidades e cenários futuros.', 'openness', false),
('hexa-mind', 36, 'Busco inovação em tudo o que faço.', 'openness', false),
('hexa-mind', 37, 'Raramente respondo impulsivamente sem refletir.', 'consistency', false),
('hexa-mind', 38, 'Mantenho coerência entre o que digo e o que faço.', 'consistency', false),
('hexa-mind', 39, 'Costumo revisar meu trabalho antes de finalizar.', 'consistency', false),
('hexa-mind', 40, 'Busco aprender com meus erros para melhorar continuamente.', 'consistency', false)
ON CONFLICT (assessment_id, sort_order) DO NOTHING;
