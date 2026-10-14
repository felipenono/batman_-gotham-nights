# Verificação no navegador

Verificação concluída no Microsoft Edge, executando a publicação real do jogo. A instrumentação de teste expôs a instância somente nas respostas do servidor temporário: nenhum arquivo de produção foi alterado para habilitar a depuração.

## Resultado

- 14 comparações visuais aprovadas, sem diferença de pixels entre as duas versões capturadas.
- Resoluções: 1280 × 720 e 390 × 844.
- Telas em cada resolução: lobby, derrota, vitória, fases 1/2/3 e pausa.
- Referência: publicação guardada antes da etapa final da refatoração. Este teste complementa os registros de desenho anteriores, sem afirmar comparação por capturas com todas as etapas históricas do projeto.
- 15 verificações funcionais aprovadas no navegador.
- Nenhuma exceção JavaScript não tratada nos fluxos percorridos.
- Nenhuma correção adicional no código do jogo foi necessária.

## Fluxos conferidos

- Lobby: logo carregada, navegação por setas e dois botões futuros bloqueados.
- Áudio sintetizado produz sinal e conclui fade-in.
- Mudo silencia a saída e desativar mudo retoma o áudio.
- Controle de volume altera o volume compartilhado.
- Enter inicia a partida, com fade de áudio e transição para preto.
- Jogabilidade: movimento e disparo pelo mouse.
- Pausa congela o cronômetro e botão Continuar retoma.
- Morte real abre derrota com pontuação e sem bônus de tempo.
- Tentar novamente reinicia a fase e zera o placar.
- Vitória recebe dados reais e bônus; próxima fase permanece bloqueada.
- Voltar ao menu restaura o lobby e preserva o volume.
- Jogar novamente inicia uma nova campanha na fase 1.
- Celular 390×844: iniciar e voltar ao menu funcionam.
- Encerramento libera o contexto de áudio e cancela a execução.
- Nenhum erro JavaScript não tratado durante a execução.

## Áudio

O contexto Web Audio foi liberado por um clique real e permaneceu ativo. Um analisador mediu sinal na saída, silêncio com mudo e sinal novamente após desativá-lo. O controle de volume foi ajustado a 25% e preservado nas trocas de tela. O fade-in chegou a ganho 1; ao iniciar a partida, o ganho caiu durante o fade-out.

Não há MP3s opcionais na pasta pública de áudio: lobby_theme.mp3, defeat.mp3, victory.mp3 e menu_click.mp3 retornaram 404, e as alternativas sintetizadas continuaram funcionando. Portanto, esta execução não valida o conteúdo desses arquivos ainda ausentes. A medição do sinal confirma reprodução técnica, não uma avaliação auditiva de qualidade ou timbre.

A derrota foi acionada por morte real do personagem. A vitória foi aberta pela API do jogo com um mob e um chefe registrados: 100 + 500 + 1000 de bônus = 1600 pontos. A conclusão de toda a campanha permanece coberta pelos testes automatizados já aprovados, sem uma nova partida completa jogada manualmente.

## Limites da conferência

As capturas comparativas congelam o tempo e desativam animações de CSS apenas no navegador de teste para permitir comparação repetível. A execução funcional mantém o loop e as transições reais. Não foram medidos FPS nem testado um controle físico conectado. O teste de celular utiliza a resolução no navegador, sem aparelho físico.

## Evidências

Foram guardadas 28 capturas comparativas (14 pares), os relatórios comparacao-visual.json e verificacao-funcional.json e capturas adicionais da execução funcional na pasta de artefatos desta conversa. As capturas foram inspecionadas para conferir a composição e a legibilidade do lobby e dos resultados.

A limitação anterior do serviço de aprovação deixou de impedir a execução nesta solicitação. A verificação visual pendente foi concluída.
