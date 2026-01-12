INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('1.1', 'BEBEDOURO', 'S.J.DO RIO PRETO', 550, '[{"name": "BEBEDOURO", "value": 0}, {"name": "OLIMPIA", "value": 0}, {"name": "S.J.DO RIO PRETO", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('1.2', 'OLIMPIA', 'JABOTICABAL', 450, '[{"name": "OLIMPIA", "value": 0}, {"name": "S.J.DO RIO PRETO", "value": 0}, {"name": "CATANDUVA", "value": 0}, {"name": "JABOTICABAL", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('1.3', 'BEBEDOURO', 'OLIMPIA', 330, '[{"name": "BEBEDOURO", "value": 0}, {"name": "BARRETOS", "value": 0}, {"name": "OLIMPIA", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('1.4', 'BEBEDOURO', 'JABOTICABAL', 430, '[{"name": "BEBEDOURO", "value": 0}, {"name": "BARRETOS", "value": 0}, {"name": "OLIMPIA", "value": 0}, {"name": "CATANDUVA", "value": 0}, {"name": "JABOTICABAL", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('2.1', 'FRANCA', 'BATATAIS', 200, '[{"name": "FRANCA", "value": 0}, {"name": "BATATAIS", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('2.2', 'FRANCA', 'ALTINOPOLIS', 390, '[{"name": "FRANCA", "value": 0}, {"name": "PASSOS", "value": 0}, {"name": "SÃO SEBASTIAO DO PARAISO", "value": 0}, {"name": "ALTINOPOLIS", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('3.1', 'POÇOS DE CALDAS', 'MOCOCA', 460, '[{"name": "POÇOS DE CALDAS", "value": 0}, {"name": "GUAXUPE", "value": 0}, {"name": "MOCOCA", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('3.2', 'PORTO FERREIRA', 'PASSOS', 560, '[{"name": "PORTO FERREIRA", "value": 0}, {"name": "POÇOS DE CALDAS", "value": 0}, {"name": "GUAXUPÉ", "value": 0}, {"name": "PASSOS", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('3.3', 'POÇOS DE CALDAS', 'MOCOCA', 570, '[{"name": "POÇOS DE CALDAS", "value": 0}, {"name": "ALFENAS", "value": 0}, {"name": "MOCOCA", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('4', 'SÃO CARLOS', 'PEDERNEIRAS', 410, '[{"name": "SÃO CARLOS", "value": 0}, {"name": "JAU", "value": 0}, {"name": "BAURU", "value": 0}, {"name": "PEDERNEIRAS", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('UBERLANDIA', 'ITUVERAVA', 'UBERLANDIA', 685, '[{"name": "ITUVERAVA", "value": 0}, {"name": "ORLANDIA", "value": 0}, {"name": "SÃO JOAQUIM DA BARRA", "value": 0}, {"name": "UBERABA", "value": 0}, {"name": "UBERLANDIA", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('ARARAQUARA', 'AMERICO', 'SERTAOZINHO', 300, '[{"name": "AMERICO", "value": 0}, {"name": "ARARAQUARA", "value": 0}, {"name": "MATAO", "value": 0}, {"name": "JABOTICABAL", "value": 0}, {"name": "SERTAOZINHO", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('RIBEIRAO PRETO', 'RIBEIRÃO PRETO', 'RIBEIRÃO PRETO', 270, '[{"name": "RIBEIRÃO PRETO", "value": 0}]', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;