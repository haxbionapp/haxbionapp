(function() {
    var LANG_KEY = 'haxball_language';
    function getLanguage() {
        var saved = localStorage.getItem(LANG_KEY);
        if (saved && (saved === 'pt' || saved === 'es' || saved === 'en')) return saved;
        var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (browserLang.indexOf('es') === 0) return 'es';
        if (browserLang.indexOf('pt') === 0) return 'pt';
        if (browserLang.indexOf('en') === 0) return 'en';
        return 'en'; 
    }

    function setLanguage(lang) {
        localStorage.setItem(LANG_KEY, lang);
        currentLang = lang;
        window.__haxLang = lang;
    }

    var currentLang = getLanguage();
    window.__haxLang = currentLang;
    window.__haxSetLanguage = setLanguage;
    window.__haxGetLanguage = getLanguage;

    var TRANSLATIONS = {
        'Name': { pt: 'Nome', es: 'Nombre' },
        'Players': { pt: 'Jogadores', es: 'Jugadores' },
        'Distance': { pt: 'País', es: 'País' },
        'Pass': { pt: 'Senha', es: 'Contraseña' },
        'Room list': { pt: 'Lista de Salas', es: 'Lista de Salas', en: 'Room list' },
        'Lista de Salas': { pt: 'Lista de Salas', es: 'Lista de Salas', en: 'Room list' },
        'Refresh': { pt: 'Atualizar', es: 'Actualizar' },
        'Ok': { pt: 'Ok', es: 'Ok' },
        'Cancel': { pt: 'Cancelar', es: 'Cancelar' },
        'Create Room': { pt: 'Criar sala', es: 'Crear sala' },
        'Join Room': { pt: 'Entrar', es: 'Entrar' },
        'Settings': { pt: 'Configurações', es: 'Configuración' },
        'Leave': { pt: 'Sair', es: 'Salir' },
        'Replays': { pt: 'Replays', es: 'Replays' },
        'Room name': { pt: 'Nome da sala', es: 'Nombre de la sala' },
        'Password': { pt: 'Senha', es: 'Contraseña' },
        'Max players': { pt: 'Máx. jogadores', es: 'Máx. jugadores' },
        'Public': { pt: 'Pública', es: 'Pública' },
        'Unlock': { pt: 'Desbloquear', es: 'Desbloquear' },
        'Lock': { pt: 'Bloquear', es: 'Bloquear' },
        'Change': { pt: 'Alterar', es: 'Cambiar' },
        'Close': { pt: 'Fechar', es: 'Cerrar' },
        'Sound': { pt: 'Som', es: 'Sonido' },
        'Video': { pt: 'Vídeo', es: 'Video' },
        'Input': { pt: 'Teclas', es: 'Teclas' },
        'Misc': { pt: 'Outros', es: 'Otros' },
        'Cole o link da sala aqui...': { pt: 'Cole o link da sala aqui...', es: 'Pega el enlace de la sala aquí...' },
        'Modo Anônimo': { pt: 'Modo Anônimo', es: 'Modo Anónimo' },
        'Esconder header': { pt: 'Esconder header', es: 'Ocultar header' },
        'Pesquisar salas...': { pt: 'Pesquisar salas...', es: 'Buscar salas...' },
        'Atualizar': { pt: 'Atualizar', es: 'Actualizar' },
        'Entrar': { pt: 'Entrar', es: 'Entrar' },
        'Criar Sala': { pt: 'Criar Sala', es: 'Crear Sala' },
        'Favoritos': { pt: 'Favoritos', es: 'Favoritos' },
        'Amizades': { pt: 'Amizades', es: 'Amistades' },
        'Equipe': { pt: 'Equipe', es: 'Equipo' },
        'Configurações': { pt: 'Configurações', es: 'Configuración' },
        'Voltar': { pt: 'Voltar', es: 'Volver' },
        'Fixar no Topo': { pt: 'Fixar no Topo', es: 'Fijar Arriba' },
        'Desafixar Sala': { pt: 'Desafixar Sala', es: 'Desfijar Sala' },
        'Adicionar aos Favoritos': { pt: 'Adicionar aos Favoritos', es: 'Añadir a Favoritos' },
        'Remover dos Favoritos': { pt: 'Remover dos Favoritos', es: 'Quitar de Favoritos' },
        'Todos os países': { pt: 'Todos os países', es: 'Todos los países' },
        'Limpar filtro': { pt: 'Limpar filtro', es: 'Limpiar filtro' },
        'Carregando...': { pt: 'Carregando...', es: 'Cargando...' },
        'Você não está em nenhuma equipe': { pt: 'Você não está em nenhuma equipe', es: 'No estás en ningún equipo' },
        'Criar Equipe': { pt: 'Criar Equipe', es: 'Crear Equipo' },
        'Criar Nova Equipe': { pt: 'Criar Nova Equipe', es: 'Crear Nuevo Equipo' },
        'Nome da Equipe': { pt: 'Nome da Equipe', es: 'Nombre del Equipo' },
        'Logo da Equipe': { pt: 'Logo da Equipe', es: 'Logo del Equipo' },
        'Escolher Imagem': { pt: 'Escolher Imagem', es: 'Elegir Imagen' },
        'Nenhuma selecionada': { pt: 'Nenhuma selecionada', es: 'Ninguna seleccionada' },
        'Preview': { pt: 'Preview', es: 'Vista previa' },
        'Cancelar': { pt: 'Cancelar', es: 'Cancelar' },
        'Criar': { pt: 'Criar', es: 'Crear' },
        'Criando...': { pt: 'Criando...', es: 'Creando...' },
        'Enviando logo...': { pt: 'Enviando logo...', es: 'Enviando logo...' },
        'Erro ao criar equipe': { pt: 'Erro ao criar equipe', es: 'Error al crear equipo' },
        'Erro de conexão': { pt: 'Erro de conexão', es: 'Error de conexión' },
        'membro(s)': { pt: 'membro(s)', es: 'miembro(s)' },
        'Sigla (máx 4)': { pt: 'Sigla (máx 4)', es: 'Sigla (máx 4)' },
        'Logo': { pt: 'Logo', es: 'Logo' },
        'Trocar': { pt: 'Trocar', es: 'Cambiar' },
        'Enviar': { pt: 'Enviar', es: 'Enviar' },
        'Salvar Alterações': { pt: 'Salvar Alterações', es: 'Guardar Cambios' },
        'Convidar Membro': { pt: 'Convidar Membro', es: 'Invitar Miembro' },
        'Username do Discord': { pt: 'Username do Discord', es: 'Usuario de Discord' },
        'Convidar': { pt: 'Convidar', es: 'Invitar' },
        'Membros': { pt: 'Membros', es: 'Miembros' },
        'Excluir Equipe': { pt: 'Excluir Equipe', es: 'Eliminar Equipo' },
        'Sair da Equipe': { pt: 'Sair da Equipe', es: 'Salir del Equipo' },
        'Nenhum membro': { pt: 'Nenhum membro', es: 'Ningún miembro' },
        'Remover': { pt: 'Remover', es: 'Eliminar' },
        'Convites Pendentes': { pt: 'Convites Pendentes', es: 'Invitaciones Pendientes' },
        'Aceitar': { pt: 'Aceitar', es: 'Aceptar' },
        'Recusar': { pt: 'Recusar', es: 'Rechazar' },
        'Convite enviado!': { pt: 'Convite enviado!', es: '¡Invitación enviada!' },
        'Erro ao convidar': { pt: 'Erro ao convidar', es: 'Error al invitar' },
        'Salvando...': { pt: 'Salvando...', es: 'Guardando...' },
        'Alterações salvas!': { pt: 'Alterações salvas!', es: '¡Cambios guardados!' },
        'Erro ao salvar': { pt: 'Erro ao salvar', es: 'Error al guardar' },
        'Pronto pra salvar': { pt: 'Pronto pra salvar', es: 'Listo para guardar' },
        'Máximo 512KB': { pt: 'Máximo 512KB', es: 'Máximo 512KB' },
        'Imagem muito grande (máx 512KB)': { pt: 'Imagem muito grande (máx 512KB)', es: 'Imagen muy grande (máx 512KB)' },
        'Nome deve ter pelo menos 3 caracteres': { pt: 'Nome deve ter pelo menos 3 caracteres', es: 'El nombre debe tener al menos 3 caracteres' },
        'Fechar': { pt: 'Fechar', es: 'Cerrar' },
        'Remover este membro?': { pt: 'Remover este membro?', es: '¿Eliminar este miembro?' },
        'Confirmar': { pt: 'Confirmar', es: 'Confirmar' },
        'Tem certeza que deseja EXCLUIR a equipe? Isso não pode ser desfeito.': { pt: 'Tem certeza que deseja EXCLUIR a equipe? Isso não pode ser desfeito.', es: '¿Estás seguro de que deseas ELIMINAR el equipo? Esto no se puede deshacer.' },
        'Tem certeza que deseja sair da equipe?': { pt: 'Tem certeza que deseja sair da equipe?', es: '¿Estás seguro de que deseas salir del equipo?' },
        'Amigos': { pt: 'Amigos', es: 'Amigos' },
        'Amizades': { pt: 'Amizades', es: 'Amistades' },
        'Adicionar Amigo': { pt: 'Adicionar Amigo', es: 'Añadir Amigo' },
        'Nenhum amigo adicionado': { pt: 'Nenhum amigo adicionado', es: 'Ningún amigo añadido' },
        'Online': { pt: 'Online', es: 'En línea' },
        'Offline': { pt: 'Offline', es: 'Desconectado' },
        'Solicitações': { pt: 'Solicitações', es: 'Solicitudes' },
        'Username do Discord': { pt: 'Username do Discord', es: 'Usuario de Discord' },
        'Nenhum usuário encontrado': { pt: 'Nenhum usuário encontrado', es: 'Ningún usuario encontrado' },
        'Adicionar': { pt: 'Adicionar', es: 'Añadir' },
        'Solicitação enviada para': { pt: 'Solicitação enviada para', es: 'Solicitud enviada a' },
        'Erro ao enviar': { pt: 'Erro ao enviar', es: 'Error al enviar' },
        'Digite um username': { pt: 'Digite um username', es: 'Escribe un usuario' },
        'Buscando...': { pt: 'Buscando...', es: 'Buscando...' },
        'Usuário não encontrado': { pt: 'Usuário não encontrado', es: 'Usuario no encontrado' },
        'Erro ao buscar usuário': { pt: 'Erro ao buscar usuário', es: 'Error al buscar usuario' },
        'Solicitações pendentes': { pt: 'Solicitações pendentes', es: 'Solicitudes pendientes' },
        'Entrar': { pt: 'Entrar', es: 'Entrar' },
        'Compartilhar': { pt: 'Compartilhar', es: 'Compartir' },
        'Compartilhado!': { pt: 'Compartilhado!', es: '¡Compartido!' },
        'Erro': { pt: 'Erro', es: 'Error' },
        'Som': { pt: 'Som', es: 'Sonido' },
        'Vídeo': { pt: 'Vídeo', es: 'Video' },
        'Controles': { pt: 'Controles', es: 'Controles' },
        'Avatares': { pt: 'Avatares', es: 'Avatares' },
        'Host Token': { pt: 'Host Token', es: 'Host Token' },
        'Temas': { pt: 'Temas', es: 'Temas' },
        'Multi-Auth': { pt: 'Multi-Auth', es: 'Multi-Auth' },
        'Diversos': { pt: 'Diversos', es: 'Varios' },
        'Auth atual: ': { pt: 'Auth atual: ', es: 'Auth actual: ' },
        'Nenhuma auth ativa. Máximo de 5 auths.': { pt: 'Nenhuma auth ativa. Máximo de 5 auths.', es: 'Ninguna auth activa. Máximo de 5 auths.' },
        'Nenhuma auth salva. Adicione uma abaixo.': { pt: 'Nenhuma auth salva. Adicione uma abaixo.', es: 'Ninguna auth guardada. Añade una abajo.' },
        'Auth ': { pt: 'Auth ', es: 'Auth ' },
        'Usar': { pt: 'Usar', es: 'Usar' },
        'Auth alterada! Feche e abra o app para aplicar.': { pt: 'Auth alterada! Feche e abra o app para aplicar.', es: '¡Auth cambiada! Cierra y abre la app para aplicar.' },
        'Auth removida': { pt: 'Auth removida', es: 'Auth eliminada' },
        'Adicionar Nova Auth': { pt: 'Adicionar Nova Auth', es: 'Añadir Nueva Auth' },
        'Nome (opcional)': { pt: 'Nome (opcional)', es: 'Nombre (opcional)' },
        'Auth Key (ex: idkey.xxx.xxx.xxx)': { pt: 'Auth Key (ex: idkey.xxx.xxx.xxx)', es: 'Auth Key (ej: idkey.xxx.xxx.xxx)' },
        'Adicionar': { pt: 'Adicionar', es: 'Añadir' },
        'Salvar Atual': { pt: 'Salvar Atual', es: 'Guardar Actual' },
        'Digite uma auth key': { pt: 'Digite uma auth key', es: 'Escribe una auth key' },
        'Formato inválido. Use: idkey.xxx.xxx.xxx': { pt: 'Formato inválido. Use: idkey.xxx.xxx.xxx', es: 'Formato inválido. Usa: idkey.xxx.xxx.xxx' },
        'Esta auth já está salva': { pt: 'Esta auth já está salva', es: 'Esta auth ya está guardada' },
        'Limite de 5 auths atingido': { pt: 'Limite de 5 auths atingido', es: 'Límite de 5 auths alcanzado' },
        'Auth adicionada!': { pt: 'Auth adicionada!', es: '¡Auth añadida!' },
        'Nenhuma auth atual para salvar': { pt: 'Nenhuma auth atual para salvar', es: 'Ninguna auth actual para guardar' },
        'Auth atual já está salva': { pt: 'Auth atual já está salva', es: 'Auth actual ya está guardada' },
        'Auth atual salva!': { pt: 'Auth atual salva!', es: '¡Auth actual guardada!' },
        'Após trocar de auth, feche e abra o app para aplicar.': { pt: 'Após trocar de auth, feche e abra o app para aplicar.', es: 'Después de cambiar de auth, cierra y abre la app para aplicar.' },

        'Tema': { pt: 'Tema', es: 'Tema' },
        'Escuro': { pt: 'Escuro', es: 'Oscuro' },
        'Claro': { pt: 'Claro', es: 'Claro' },
        'Padrão': { pt: 'Padrão', es: 'Predeterminado' },
        'Onix': { pt: 'Onix', es: 'Onix' },
        'Sem alterações de cor': { pt: 'Sem alterações de cor', es: 'Sin cambios de color' },
        'Reduz o cansaço visual': { pt: 'Reduz o cansaço visual', es: 'Reduce la fatiga visual' },
        'Melhor visibilidade': { pt: 'Melhor visibilidade', es: 'Mejor visibilidad' },
        'Preto total, escuridão absoluta': { pt: 'Preto total, escuridão absoluta', es: 'Negro total, oscuridad absoluta' },
        'Desempenho': { pt: 'Desempenho', es: 'Rendimiento' },
        'Ative as opções para melhorar o FPS.': { pt: 'Ative as opções para melhorar o FPS.', es: 'Activa las opciones para mejorar el FPS.' },
        'Linhas simplificadas': { pt: 'Linhas simplificadas', es: 'Líneas simplificadas' },
        'Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.': { pt: 'Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.', es: 'Reduce el grosor de las líneas del campo de 3px a 1px. Menos píxeles para dibujar.' },
        'Curvas viram retas': { pt: 'Curvas viram retas', es: 'Curvas se vuelven rectas' },
        'Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que arcos.': { pt: 'Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que arcos.', es: 'Convierte todas las líneas curvas en rectas. Dibujar rectas es mucho más rápido que arcos.' },
        'Culling de viewport': { pt: 'Culling de viewport', es: 'Culling de viewport' },
        'Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.': { pt: 'Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.', es: 'No dibuja objetos fuera de la pantalla. En mapas grandes, evita renderizar lo que no ves.' },
        'Desativar avatares e cores': { pt: 'Desativar avatares e cores', es: 'Desactivar avatares y colores' },
        'Remove avatares personalizados e usa cores padrão dos times. Menos texturas.': { pt: 'Remove avatares personalizados e usa cores padrão dos times. Menos texturas.', es: 'Elimina avatares personalizados y usa colores estándar de los equipos. Menos texturas.' },
        'Desativar nomes': { pt: 'Desativar nomes', es: 'Desactivar nombres' },
        'Esconde os nomes dos jogadores. Menos texto para renderizar.': { pt: 'Esconde os nomes dos jogadores. Menos texto para renderizar.', es: 'Oculta los nombres de los jugadores. Menos texto para renderizar.' },
        'Campo simplificado': { pt: 'Campo simplificado', es: 'Campo simplificado' },
        'Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.': { pt: 'Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.', es: 'Usa colores sólidos en el campo en lugar de degradados. Renderizado más simple.' },
        'Círculos de baixa qualidade': { pt: 'Círculos de baixa qualidade', es: 'Círculos de baja calidad' },
        'Pré-renderiza os círculos. Mais rápido mas visual pixelado.': { pt: 'Pré-renderiza os círculos. Mais rápido mas visual pixelado.', es: 'Pre-renderiza los círculos. Más rápido pero visual pixelado.' },
        'Gráficos brutos': { pt: 'Gráficos brutos', es: 'Gráficos crudos' },
        'Desativa suavização de imagens. Visual mais pixelado mas processamento mais rápido.': { pt: 'Desativa suavização de imagens. Visual mais pixelado mas processamento mais rápido.', es: 'Desactiva el suavizado de imágenes. Visual más pixelado pero procesamiento más rápido.' },
        'Desativar animações de gol': { pt: 'Desativar animações de gol', es: 'Desactivar animaciones de gol' },
        'Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.': { pt: 'Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.', es: 'Elimina las animaciones cuando se marca un gol. Evita caídas de FPS momentáneas.' },
        'Desativar indicador do jogador': { pt: 'Desativar indicador do jogador', es: 'Desactivar indicador del jugador' },
        'A seta que mostra onde você está. Economiza um pouco de renderização.': { pt: 'A seta que mostra onde você está. Economiza um pouco de renderização.', es: 'La flecha que muestra dónde estás. Ahorra un poco de renderizado.' },
        'Desativar indicador de chat': { pt: 'Desativar indicador de chat', es: 'Desactivar indicador de chat' },
        'O balão que aparece quando alguém fala. Remove essa renderização extra.': { pt: 'O balão que aparece quando alguém fala. Remove essa renderização extra.', es: 'El globo que aparece cuando alguien habla. Elimina ese renderizado extra.' },
        'Alta prioridade': { pt: 'Alta prioridade', es: 'Alta prioridad' },
        'Dá mais recursos do sistema para o jogo. Pode travar outros programas. Use com cuidado!': { pt: 'Dá mais recursos do sistema para o jogo. Pode travar outros programas. Use com cuidado!', es: 'Da más recursos del sistema al juego. Puede bloquear otros programas. ¡Usa con cuidado!' },
        'Cuidado': { pt: 'Cuidado', es: 'Cuidado' },
        'Mostrar nomes dos jogadores': { pt: 'Mostrar nomes dos jogadores', es: 'Mostrar nombres de jugadores' },
        'Mostrar avatares e cores': { pt: 'Mostrar avatares e cores', es: 'Mostrar avatares y colores' },
        'Mostrar indicador do jogador': { pt: 'Mostrar indicador do jogador', es: 'Mostrar indicador del jugador' },
        'Mostrar animações de gol': { pt: 'Mostrar animações de gol', es: 'Mostrar animaciones de gol' },
        'Mostrar indicador de chat': { pt: 'Mostrar indicador de chat', es: 'Mostrar indicador de chat' },
        'Alta prioridade (pode travar o sistema)': { pt: 'Alta prioridade (pode travar o sistema)', es: 'Alta prioridad (puede bloquear el sistema)' },
        'Culling de viewport (não desenhar fora da tela)': { pt: 'Culling de viewport (não desenhar fora da tela)', es: 'Culling de viewport (no dibujar fuera de pantalla)' },
        'Mutados:': { pt: 'Mutados:', es: 'Silenciados:' },
        'Nenhum jogador mutado': { pt: 'Nenhum jogador mutado', es: 'Ningún jugador silenciado' },
        'Defina teclas de atalho para trocar de avatar rapidamente durante o jogo.': { pt: 'Defina teclas de atalho para trocar de avatar rapidamente durante o jogo.', es: 'Define teclas de acceso rápido para cambiar de avatar rápidamente durante el juego.' },
        'Adicionar atalho': { pt: 'Adicionar atalho', es: 'Añadir atajo' },
        'Novo Atalho': { pt: 'Novo Atalho', es: 'Nuevo Atajo' },
        'Editar Atalho': { pt: 'Editar Atalho', es: 'Editar Atajo' },
        'Tecla de Atalho': { pt: 'Tecla de Atalho', es: 'Tecla de Atajo' },
        'Avatar (emoji ou texto)': { pt: 'Avatar (emoji ou texto)', es: 'Avatar (emoji o texto)' },
        'Clique para definir tecla': { pt: 'Clique para definir tecla', es: 'Haz clic para definir tecla' },
        'Pressione uma tecla...': { pt: 'Pressione uma tecla...', es: 'Presiona una tecla...' },
        'Tecla inválida, tente outra': { pt: 'Tecla inválida, tente outra', es: 'Tecla inválida, intenta otra' },
        'Editar': { pt: 'Editar', es: 'Editar' },
        'Salvar': { pt: 'Salvar', es: 'Guardar' },
        'vazio': { pt: 'vazio', es: 'vacío' },
        'Configure seu host token para criar salas sem captcha.': { pt: 'Configure seu host token para criar salas sem captcha.', es: 'Configura tu host token para crear salas sin captcha.' },
        'Cole seu host token aqui': { pt: 'Cole seu host token aqui', es: 'Pega tu host token aquí' },
        'Limpar': { pt: 'Limpar', es: 'Limpiar' },
        'Ocultar Chat': { pt: 'Ocultar Chat', es: 'Ocultar Chat' },
        'Ocultar Placar/Timer': { pt: 'Ocultar Placar/Timer', es: 'Ocultar Marcador/Tiempo' },
        'Ocultar Ping/FPS': { pt: 'Ocultar Ping/FPS', es: 'Ocultar Ping/FPS' },
        'Desbloqueie recursos exclusivos:': { pt: 'Desbloqueie recursos exclusivos:', es: 'Desbloquea recursos exclusivos:' },
        'Verificado automático': { pt: 'Verificado automático', es: 'Verificado automático' },
        'Cor personalizada do verificado': { pt: 'Cor personalizada do verificado', es: 'Color personalizado del verificado' },
        'Cor do nick na lista': { pt: 'Cor do nick na lista', es: 'Color del nick en la lista' },
        'Banners exclusivos na lista': { pt: 'Banners exclusivos na lista', es: 'Banners exclusivos en la lista' },
        'Banner Exclusivo': { pt: 'Banner Exclusivo', es: 'Banner Exclusivo' },
        'Fonte personalizada do nick': { pt: 'Fonte personalizada do nick', es: 'Fuente personalizada del nick' },
        'Fonte do Nick': { pt: 'Fonte do Nick', es: 'Fuente del Nick' },
        'Fonte': { pt: 'Fonte', es: 'Fuente' },
        'Banner': { pt: 'Banner', es: 'Banner' },
        'Cor do Nick': { pt: 'Cor do Nick', es: 'Color del Nick' },
        'Criar equipes': { pt: 'Criar equipes', es: 'Crear equipos' },
        'Suporte prioritário': { pt: 'Suporte prioritário', es: 'Soporte prioritario' },
        'Acesso antecipado às novidades': { pt: 'Acesso antecipado às novidades', es: 'Acceso anticipado a las novedades' },
        'Assinar Pro - $4/mês': { pt: 'Assinar Pro - $4/mês', es: 'Suscribirse Pro - $4/mes' },
        'Assinar por $4/mês': { pt: 'Assinar por $4/mês', es: 'Suscribirse por $4/mes' },
        'Adquirir com Boost': { pt: 'Adquirir com Boost', es: 'Obtener con Boost' },
        'Verificando...': { pt: 'Verificando...', es: 'Verificando...' },
        'PRO Ativado!': { pt: 'PRO Ativado!', es: '¡PRO Activado!' },
        'Faça logout e login novamente': { pt: 'Faça logout e login novamente', es: 'Cierra sesión e inicia sesión de nuevo' },
        'Dê boost no Discord primeiro': { pt: 'Dê boost no Discord primeiro', es: 'Da boost en Discord primero' },
        'Erro ao verificar': { pt: 'Erro ao verificar', es: 'Error al verificar' },
        'Pagamento seguro via Stripe': { pt: 'Pagamento seguro via Stripe', es: 'Pago seguro vía Stripe' },
        'Ativo': { pt: 'Ativo', es: 'Activo' },
        'Válido até': { pt: 'Válido até', es: 'Válido hasta' },
        'Vitalício': { pt: 'Vitalício', es: 'Vitalicio' },
        'Cor do Verificado': { pt: 'Cor do Verificado', es: 'Color del Verificado' },
        'Cor do Nick na Lista': { pt: 'Cor do Nick na Lista', es: 'Color del Nick en la Lista' },
        'Cor do nick na lista e chat': { pt: 'Cor do nick na lista e chat', es: 'Color del nick en la lista y chat' },
        'Cor do Nick na Lista e Chat': { pt: 'Cor do Nick na Lista e Chat', es: 'Color del Nick en la Lista y Chat' },
        'Preview': { pt: 'Preview', es: 'Vista previa' },
        'Salvando...': { pt: 'Salvando...', es: 'Guardando...' },
        'Salvo!': { pt: 'Salvo!', es: '¡Guardado!' },
        'Recurso Pro': { pt: 'Recurso Pro', es: 'Recurso Pro' },
        'Apenas usuários Pro podem criar equipes.': { pt: 'Apenas usuários Pro podem criar equipes.', es: 'Solo los usuarios Pro pueden crear equipos.' },
        'Personalização': { pt: 'Personalização', es: 'Personalización' },
        'Sincronizar cores (Nick → Verificado)': { pt: 'Sincronizar cores (Nick → Verificado)', es: 'Sincronizar colores (Nick → Verificado)' },
        'Sincronizado!': { pt: 'Sincronizado!', es: '¡Sincronizado!' },
        'Cores do banner:': { pt: 'Cores do banner:', es: 'Colores del banner:' },
        'Altere cores, fontes e gradientes do seu nick e chat. Destaque-se na lista de jogadores com banners exclusivos.': { pt: 'Altere cores, fontes e gradientes do seu nick e chat. Destaque-se na lista de jogadores com banners exclusivos.', es: 'Cambia colores, fuentes y gradientes de tu nick y chat. Destácate en la lista de jugadores con banners exclusivos.' },
        'Ganhe um selo de verificado único com a cor que você escolher.': { pt: 'Ganhe um selo de verificado único com a cor que você escolher.', es: 'Obtén un sello de verificado único con el color que elijas.' },
        'Monte sua própria equipe e jogue com amigos usando identidade visual única.': { pt: 'Monte sua própria equipe e jogue com amigos usando identidade visual única.', es: 'Arma tu propio equipo y juega con amigos usando identidad visual única.' },
        'Seja o primeiro a testar novos recursos antes de todo mundo.': { pt: 'Seja o primeiro a testar novos recursos antes de todo mundo.', es: 'Sé el primero en probar nuevos recursos antes que todos.' },
        'Sua assinatura ajuda a manter o aplicativo funcionando e evoluindo.': { pt: 'Sua assinatura ajuda a manter o aplicativo funcionando e evoluindo.', es: 'Tu suscripción ayuda a mantener la app funcionando y evolucionando.' },
        'Assinar por R$19,90/mês': { pt: 'Assinar por R$19,90/mês', es: 'Suscribirse por R$19,90/mes' },
        'Esticar': { pt: 'Esticar', es: 'Estirar', en: 'Stretch' },
        'Estirar': { pt: 'Esticar', es: 'Estirar', en: 'Stretch' },
        'Nativo': { pt: 'Nativo', es: 'Nativo', en: 'Native' },
        'Quality Mode:': { pt: 'Qualidade:', es: 'Calidad:', en: 'Quality:' },
        'Performance (90%)': { pt: 'Desempenho (90%)', es: 'Rendimiento (90%)', en: 'Performance (90%)' },
        'HD (100%)': { pt: 'HD (100%)', es: 'HD (100%)', en: 'HD (100%)' },
        'Guardar': { pt: 'Salvar', es: 'Guardar', en: 'Save' },
        'Borrar': { pt: 'Apagar', es: 'Borrar', en: 'Delete' },
        'Opacidad del marcador': { pt: 'Opacidade do placar', es: 'Opacidad del marcador', en: 'Scoreboard opacity' },
        'Ajustes extra del cliente. Los cambios se aplican inmediatamente.': { pt: 'Ajustes extras do cliente. As mudanças são aplicadas imediatamente.', es: 'Ajustes extra del cliente. Los cambios se aplican inmediatamente.', en: 'Extra client settings. Changes apply immediately.' },
        'Activo': { pt: 'Ativo', es: 'Activo', en: 'On' },
        'Apagado': { pt: 'Desligado', es: 'Apagado', en: 'Off' },
        'Jimer': { pt: 'Jimer', es: 'Jimer', en: 'Jimer' },
        'Activa el comportamiento especial de Jimer dentro del cliente.': { pt: 'Ativa o comportamento especial do Jimer dentro do cliente.', es: 'Activa el comportamiento especial de Jimer dentro del cliente.', en: 'Enables the special Jimer behavior inside the client.' },
        'Ping Jimer': { pt: 'Ping Jimer', es: 'Ping Jimer', en: 'Jimer Ping' },
        'Fuerza el valor mostrado junto al ping real. Usa 0 para desactivarlo.': { pt: 'Força o valor exibido junto ao ping real. Use 0 para desativar.', es: 'Fuerza el valor mostrado junto al ping real. Usa 0 para desactivarlo.', en: 'Forces the value shown next to the real ping. Use 0 to disable it.' },
        'Start/Stop Match': { pt: 'Iniciar/Parar partida', es: 'Iniciar/Detener partida', en: 'Start/Stop Match' },
        'Record / Stop Replay': { pt: 'Gravar / Parar replay', es: 'Grabar / Detener replay', en: 'Record / Stop Replay' },
        'Paste the room link...': { pt: 'Cole o link da sala...', es: 'Pega el link de la sala...', en: 'Paste the room link...' },
        'Pega el link de la sala...': { pt: 'Cole o link da sala...', es: 'Pega el link de la sala...', en: 'Paste the room link...' },
        'Go to Haxball': { pt: 'Ir para o Haxball', es: 'Ir a Haxball', en: 'Go to Haxball' },
        'Ir a Haxball': { pt: 'Ir para o Haxball', es: 'Ir a Haxball', en: 'Go to Haxball' },
        'Hide (F2)': { pt: 'Esconder (F2)', es: 'Ocultar (F2)', en: 'Hide (F2)' },
        'Ocultar (F2)': { pt: 'Esconder (F2)', es: 'Ocultar (F2)', en: 'Hide (F2)' },
        'Language': { pt: 'Idioma', es: 'Idioma', en: 'Language' },
        'Configuración': { pt: 'Configurações', es: 'Configuración', en: 'Settings' },
        'Rendimiento': { pt: 'Desempenho', es: 'Rendimiento', en: 'Performance' },
        'Lista de salas': { pt: 'Lista de Salas', es: 'Lista de salas', en: 'Room list' },
        'Sin gris al gol': { pt: 'Sem cinza ao gol', es: 'Sin gris al gol', en: 'No goal grayscale' },
        'Elimina el efecto gris del canvas al marcar gol.': { pt: 'Elimina o efeito cinza do canvas ao marcar gol.', es: 'Elimina el efecto gris del canvas al marcar gol.', en: 'Removes the gray canvas effect when a goal is scored.' },
        'Sin barra de gol': { pt: 'Sem barra de gol', es: 'Sin barra de gol', en: 'No goal bar' },
        'Oculta la barra blanca animada al marcar gol.': { pt: 'Oculta a barra branca animada ao marcar gol.', es: 'Oculta la barra blanca animada al marcar gol.', en: 'Hides the animated white goal bar.' },
        'Sin texto de gol': { pt: 'Sem texto de gol', es: 'Sin texto de gol', en: 'No goal text' },
        'Elimina el texto Scores!/Victorious! al gol.': { pt: 'Elimina o texto Scores!/Victorious! ao gol.', es: 'Elimina el texto Scores!/Victorious! al gol.', en: 'Removes the Scores!/Victorious! text on goals.' },
        'Sin kick range': { pt: 'Sem kick range', es: 'Sin kick range', en: 'Hide kick range' },
        'Oculta el circulo de alcance de patada.': { pt: 'Oculta o círculo de alcance do chute.', es: 'Oculta el circulo de alcance de patada.', en: 'Hides the kick range circle.' },
        'Campo simplificado': { pt: 'Campo simplificado', es: 'Campo simplificado', en: 'Simple field' },
        'Usa colores sólidos en el campo en lugar de degradados. Renderizado más simple.': { pt: 'Usa cores sólidas no campo em vez de degradados. Renderização mais simples.', es: 'Usa colores sólidos en el campo en lugar de degradados. Renderizado más simple.', en: 'Uses flat field colors instead of gradients for simpler rendering.' },
        'Círculos de baja calidad': { pt: 'Círculos de baixa qualidade', es: 'Círculos de baja calidad', en: 'Low quality circles' },
        'Pre-renderiza los círculos. Más rápido pero visual pixelado.': { pt: 'Pré-renderiza os círculos. Mais rápido, mas com visual pixelado.', es: 'Pre-renderiza los círculos. Más rápido pero visual pixelado.', en: 'Pre-renders circles. Faster, but more pixelated.' },
        'Ocultar gráfico FPS': { pt: 'Ocultar gráfico FPS', es: 'Ocultar gráfico FPS', en: 'Hide FPS graph' },
        'Oculta el gráfico de FPS/ping del juego.': { pt: 'Oculta o gráfico de FPS/ping do jogo.', es: 'Oculta el gráfico de FPS/ping del juego.', en: 'Hides the in-game FPS/ping graph.' },
        'Resetear a valores por defecto': { pt: 'Resetar para os valores padrão', es: 'Resetear a valores por defecto', en: 'Reset to defaults' },
        'Ative as opções para melhorar o FPS.': { pt: 'Ative as opções para melhorar o FPS.', es: 'Activa las opciones para mejorar el FPS.', en: 'Enable options to improve FPS.' },
        'Controles': { pt: 'Controles', es: 'Controles', en: 'Controls' },
        'Geo': { pt: 'Geo', es: 'Geo', en: 'Geo' },
        'Geo Bypass': { pt: 'Geo Bypass', es: 'Geo Bypass', en: 'Geo Bypass' },
        'Extrapolación': { pt: 'Extrapolação', es: 'Extrapolación', en: 'Extrapolation' },
        'Grosor de líneas': { pt: 'Espessura das linhas', es: 'Grosor de líneas', en: 'Line thickness' },
        'Jugadores': { pt: 'Jogadores', es: 'Jugadores', en: 'Players' },
        'Pelota': { pt: 'Bola', es: 'Pelota', en: 'Ball' },
        'Cancha': { pt: 'Campo', es: 'Cancha', en: 'Field' },
        'Arco': { pt: 'Gol', es: 'Arco', en: 'Goal' },
        'Fuente del avatar': { pt: 'Fonte do avatar', es: 'Fuente del avatar', en: 'Avatar font' },
        'Selecciona una bandera desde la pantalla de sala y luego activa el bypass aquí.': { pt: 'Selecione uma bandeira na tela da sala e depois ative o bypass aqui.', es: 'Selecciona una bandera desde la pantalla de sala y luego activa el bypass aquí.', en: 'Select a flag from the room screen and then enable the bypass here.' },
        'Sincroniza tu ubicación real con la bandera elegida. Útil para evitar restricciones geográficas.': { pt: 'Sincroniza sua localização real com a bandeira escolhida. Útil para evitar restrições geográficas.', es: 'Sincroniza tu ubicación real con la bandera elegida. Útil para evitar restricciones geográficas.', en: 'Sync your real location with the chosen flag. Useful for bypassing geographic restrictions.' },
        'Sincronizar Bypass': { pt: 'Sincronizar Bypass', es: 'Sincronizar Bypass', en: 'Sync Bypass' },
        'Desactivar Bypass': { pt: 'Desativar Bypass', es: 'Desactivar Bypass', en: 'Disable Bypass' },
        'Eliminar Override': { pt: 'Remover Override', es: 'Eliminar Override', en: 'Remove Override' },
        'Override activo:': { pt: 'Override ativo:', es: 'Override activo:', en: 'Active override:' },
        'Ubicación real:': { pt: 'Localização real:', es: 'Ubicación real:', en: 'Real location:' },
        'Bypass ACTIVO — usando coords reales + bandera override': { pt: 'Bypass ATIVO - usando coords reais + bandeira override', es: 'Bypass ACTIVO — usando coords reales + bandera override', en: 'Bypass ACTIVE - using real coords + override flag' },
        '¡Bypass activado y sincronizado!': { pt: 'Bypass ativado e sincronizado!', es: '¡Bypass activado y sincronizado!', en: 'Bypass enabled and synced!' },
        'Bypass desactivado': { pt: 'Bypass desativado', es: 'Bypass desactivado', en: 'Bypass disabled' },
        'Override eliminado': { pt: 'Override removido', es: 'Override eliminado', en: 'Override removed' },
        'No hay atajos configurados. Añadí uno abajo.': { pt: 'Nenhum atalho configurado. Adicione um abaixo.', es: 'No hay atajos configurados. Añadí uno abajo.', en: 'No shortcuts configured. Add one below.' },
        'Nuevo atajo': { pt: 'Novo atalho', es: 'Nuevo atajo', en: 'New shortcut' },
        'Tecla': { pt: 'Tecla', es: 'Tecla', en: 'Key' },
        'Valor entre 0 y 500': { pt: 'Valor entre 0 e 500', es: 'Valor entre 0 y 500', en: 'Value between 0 and 500' },
        'Atajo añadido!': { pt: 'Atalho adicionado!', es: 'Atajo añadido!', en: 'Shortcut added!' },
        'Ingresá una tecla': { pt: 'Digite uma tecla', es: 'Ingresá una tecla', en: 'Enter a key' },
        'Esa tecla ya está usada': { pt: 'Essa tecla já está em uso', es: 'Esa tecla ya está usada', en: 'That key is already in use' },
        'Ej: tecla X → 300 ms. Funciona durante la partida siempre que no estés escribiendo en el chat.': { pt: 'Ex: tecla X -> 300 ms. Funciona durante a partida sempre que você não esteja escrevendo no chat.', es: 'Ej: tecla X → 300 ms. Funciona durante la partida siempre que no estés escribiendo en el chat.', en: 'Example: key X -> 300 ms. Works during the match while you are not typing in chat.' },
        'Click to change shortcut key': { pt: 'Clique para alterar a tecla de atalho', es: 'Haz clic para cambiar la tecla rápida', en: 'Click to change shortcut key' }
    };
    function t(key) {
        var entry = TRANSLATIONS[key];
        if (!entry) return key;
        return entry[currentLang] || entry['pt'] || key;
    }
    window.__t = t;
    window.__TRANSLATIONS = TRANSLATIONS;

    function translateElement(el) {
        if (!el) return;
        if (el.getAttribute('data-hook') === 'share-friends') return;
        ['placeholder', 'title'].forEach(function(attr) {
            var attrValue = el.getAttribute && el.getAttribute(attr);
            if (!attrValue) return;
            var attrEntry = TRANSLATIONS[attrValue];
            if (attrEntry && attrEntry[currentLang]) {
                el.setAttribute(attr, attrEntry[currentLang]);
            }
        });
        var currentText = (el.textContent || '').trim();
        if (el.dataset.translatedSource === currentText && el.dataset.translatedLang === currentLang) return;
        if (el.children.length > 0) {
            var hasOnlyIconChild = el.children.length === 1 && el.children[0].tagName === 'I';
            if (!hasOnlyIconChild) return;
        }

        var text = currentText;
        var entry = TRANSLATIONS[text];
        if (entry && entry[currentLang]) {
            var icon = el.querySelector('i');
            if (icon) {
                var iconClone = icon.cloneNode(true);
                el.textContent = entry[currentLang];
                el.insertBefore(iconClone, el.firstChild);
            } else {
                el.textContent = entry[currentLang];
            }
            el.dataset.translatedSource = (el.textContent || '').trim();
            el.dataset.translatedLang = currentLang;
            return;
        }
        if (!text) return;

        var translated = null;
        if (/ ahora es admin$/.test(text)) {
            translated = currentLang === 'pt'
                ? text.replace(/ ahora es admin$/, ' agora é admin')
                : currentLang === 'en'
                ? text.replace(/ ahora es admin$/, ' is now admin')
                : null;
        } else if (/'s admin rights were taken away$/.test(text)) {
            translated = currentLang === 'pt'
                ? text.replace(/'s admin rights were taken away$/, ' teve os direitos de admin removidos')
                : currentLang === 'es'
                ? text.replace(/'s admin rights were taken away$/, ' ya no es admin')
                : null;
        } else if (/ fue movido al /.test(text)) {
            translated = currentLang === 'pt'
                ? text.replace(/ fue movido al /, ' foi movido para ')
                : currentLang === 'en'
                ? text.replace(/ fue movido al /, ' was moved to ')
                : null;
        } else if (/^Kick /.test(text)) {
            translated = currentLang === 'pt'
                ? text.replace(/^Kick /, 'Expulsar ')
                : currentLang === 'es'
                ? text
                : text.replace(/^Kick /, 'Kick ');
        } else if (/^Give Admin$/.test(text)) {
            translated = currentLang === 'pt' ? 'Dar admin' : currentLang === 'es' ? 'Dar admin' : 'Give Admin';
        } else if (/^Remove Admin$/.test(text)) {
            translated = currentLang === 'pt' ? 'Remover admin' : currentLang === 'es' ? 'Quitar admin' : 'Remove Admin';
        } else if (/^You were banned/.test(text)) {
            translated = currentLang === 'pt' ? 'Você foi banido' : currentLang === 'es' ? 'Fuiste baneado' : null;
        } else if (/^You were kicked/.test(text)) {
            translated = currentLang === 'pt' ? 'Você foi kickado' : currentLang === 'es' ? 'Fuiste expulsado' : null;
        } else if (/^¿Salir de la sala\?$/.test(text)) {
            translated = currentLang === 'pt' ? 'Sair da sala?' : currentLang === 'en' ? 'Leave room?' : null;
        } else if (/^¿Estás seguro de que deseas abandonar la sala\?$/.test(text)) {
            translated = currentLang === 'pt' ? 'Tem certeza de que deseja sair da sala?' : currentLang === 'en' ? 'Are you sure you want to leave the room?' : null;
        } else if (/^Start game$/.test(text)) {
            translated = currentLang === 'pt' ? 'Iniciar jogo' : currentLang === 'es' ? 'Iniciar juego' : null;
        } else if (/^Stop game$/.test(text)) {
            translated = currentLang === 'pt' ? 'Parar jogo' : currentLang === 'es' ? 'Detener juego' : null;
        } else if (/^Pause$/.test(text)) {
            translated = currentLang === 'pt' ? 'Pausar' : currentLang === 'es' ? 'Pausar' : null;
        } else if (/^Time limit$/.test(text)) {
            translated = currentLang === 'pt' ? 'Limite de tempo' : currentLang === 'es' ? 'Límite de tiempo' : null;
        } else if (/^Score limit$/.test(text)) {
            translated = currentLang === 'pt' ? 'Límite de gols' : currentLang === 'es' ? 'Límite de goles' : null;
        } else if (/^Stadium$/.test(text)) {
            translated = currentLang === 'pt' ? 'Estádio' : currentLang === 'es' ? 'Estadio' : null;
        } else if (/^Contrase/.test(text)) {
            translated = currentLang === 'pt' ? 'Senha incorreta.' : currentLang === 'en' ? 'Wrong password.' : null;
        } else if (/^Fuiste baneado/.test(text)) {
            translated = currentLang === 'pt' ? 'Você foi banido deste host.' : currentLang === 'en' ? 'You were banned from this host.' : null;
        }
        if (translated && translated !== text) {
            el.textContent = translated;
            el.dataset.translatedSource = (el.textContent || '').trim();
            el.dataset.translatedLang = currentLang;
        } else {
            el.dataset.translatedSource = text;
            el.dataset.translatedLang = currentLang;
        }
    }

    function translateAll(doc) {
        if (!currentLang) return;
        var all = doc.querySelectorAll('table.header td,th,button,h1,h2,h3,label,span,div,p,option,input[placeholder],textarea[placeholder],[title]');
        for (var i = 0; i < all.length; i++) translateElement(all[i]);
    }

    function init() {
        translateAll(document);
        if (document.body) {
            // Coalescido via rAF ademas de lo de characterData de abajo: con
            // el marcador y el reloj actualizando texto varias veces por
            // segundo (eso SI dispara childList en el elemento padre, aunque
            // characterData este apagado), este observer se disparaba igual
            // de seguido. Ahora las mutaciones de un mismo frame se procesan
            // juntas una sola vez.
            var _pendingTransMuts = [];
            var _transScheduled = false;
            function _flushTransMuts() {
                _transScheduled = false;
                var muts = _pendingTransMuts;
                _pendingTransMuts = [];
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        var node = added[j];
                        if (!node) continue;
                        if (node.nodeType === 3) {
                            if (node.parentElement) translateElement(node.parentElement);
                            continue;
                        }
                        if (node.nodeType !== 1) continue;
                        translateElement(node);
                        if (node.querySelectorAll) translateAll(node);
                        if (Injector.isGameFrame() && node.classList && node.classList.contains('settings-view')) {
                            translateSettingsDialog(node);
                        }
                    }
                }
            }
            var _allObs = new MutationObserver(function(muts) {
                for (var i = 0; i < muts.length; i++) _pendingTransMuts.push(muts[i]);
                if (_transScheduled) return;
                _transScheduled = true;
                requestAnimationFrame(_flushTransMuts);
            });
            // characterData:true sacado a proposito: hacia que este observer
            // se dispare por CUALQUIER cambio de texto en toda la pagina
            // (chat, marcador, timers, etc.), generando trabajo constante en
            // el hilo principal aunque no hubiera nada nuevo para traducir.
            // Los textos ya traducidos se detectan igual al insertarse nodos
            // nuevos (childList), asi que sacarlo no rompe la traduccion.
            _allObs.observe(document.body, { childList: true, subtree: true });
        }
        if (Injector.isGameFrame()) {
            Injector.onView('view', function(el) {
                translateAll(el);
            });
            Injector.onView('dialog', function(el) {
                translateAll(el);
                translateSettingsDialog(el);
            });
            // El observer separado que habia aca (_trObs, otro subtree:true en
            // <body>) hacia exactamente la misma deteccion de settings-view
            // que ya cubre _allObs mas arriba (linea ~478) — dos observers
            // completos escaneando toda la pagina para el mismo resultado.
            // Se saca directamente, no se pierde nada.
        }
    }
    function translateSettingsDialog(el) {
        var root = el || document;
        var hookTranslations = {
            'tmisc-title': 'Desempenho',
            'tmisc-shownames': 'Mostrar nomes dos jogadores',
            'tmisc-showavatars': 'Mostrar avatares e cores',
            'tmisc-imgsmoothing': 'Gráficos crudos',
            'tmisc-showindicator': 'Mostrar indicador do jogador',
            'tmisc-simplelines': 'Líneas simplificadas',
            'tmisc-simplefield': 'Campo simplificado',
            'tmisc-showanimations': 'Mostrar animações de gol',
            'tmisc-showchat': 'Mostrar indicador de chat',
            'tmisc-highpriority': 'Alta prioridade (pode travar o sistema)',
            'tmisc-culling': 'Culling de viewport (não desenhar fora da tela)',
            'hideui-chat': 'Ocultar Chat',
            'hideui-scoreboard': 'Ocultar Placar/Tempo',
            'hideui-pingfps': 'Ocultar Ping/FPS',
            'qualitymode-label': 'Qualidade:'
        };
        if (currentLang === 'es') {
            hookTranslations = {
                'tmisc-title': 'Rendimiento',
                'tmisc-shownames': 'Mostrar nombres de jugadores',
                'tmisc-showavatars': 'Mostrar avatares y colores',
                'tmisc-imgsmoothing': 'Gráficos crudos',
                'tmisc-showindicator': 'Mostrar indicador del jugador',
                'tmisc-simplelines': 'Líneas simplificadas',
                'tmisc-simplefield': 'Campo simplificado',
                'tmisc-showanimations': 'Mostrar animaciones de gol',
                'tmisc-showchat': 'Mostrar indicador de chat',
                'tmisc-highpriority': 'Alta prioridad (puede bloquear el sistema)',
                'tmisc-culling': 'Culling de viewport (no dibujar fuera de pantalla)',
                'hideui-chat': 'Ocultar Chat',
                'hideui-scoreboard': 'Ocultar Marcador/Tiempo',
                'hideui-pingfps': 'Ocultar Ping/FPS',
                'qualitymode-label': 'Calidad:'
            };
        } else if (currentLang === 'en') {
            hookTranslations = {
                'tmisc-title': 'Performance',
                'tmisc-shownames': 'Show player names',
                'tmisc-showavatars': 'Show avatars and colors',
                'tmisc-imgsmoothing': 'Raw graphics',
                'tmisc-showindicator': 'Show player indicator',
                'tmisc-simplelines': 'Simple lines',
                'tmisc-simplefield': 'Simple field',
                'tmisc-showanimations': 'Show goal animations',
                'tmisc-showchat': 'Show chat indicator',
                'tmisc-highpriority': 'High priority (may freeze the system)',
                'tmisc-culling': 'Viewport culling (do not draw off-screen)',
                'hideui-chat': 'Hide Chat',
                'hideui-scoreboard': 'Hide Scoreboard/Timer',
                'hideui-pingfps': 'Hide Ping/FPS',
                'qualitymode-label': 'Quality:'
            };
        }
        for (var hook in hookTranslations) {
            var hookEl = root.querySelector('[data-hook="' + hook + '"]');
            if (!hookEl) hookEl = document.querySelector('[data-hook="' + hook + '"]');
            if (hookEl) {
                var icon = hookEl.querySelector('i');
                if (icon) {
                    var iconClass = icon.className;
                    var childNodes = hookEl.childNodes;
                    for (var i = childNodes.length - 1; i >= 0; i--) {
                        if (childNodes[i].nodeType === 3) { // TEXT_NODE
                            hookEl.removeChild(childNodes[i]);
                        }
                    }
                    hookEl.appendChild(document.createTextNode(hookTranslations[hook]));
                } else {
                    hookEl.textContent = hookTranslations[hook];
                }
            }
        }
        var qualitySelect = root.querySelector('[data-hook="qualitymode"]');
        if (!qualitySelect) qualitySelect = document.querySelector('[data-hook="qualitymode"]');
        if (qualitySelect && qualitySelect.options) {
            for (var i = 0; i < qualitySelect.options.length; i++) {
                var opt = qualitySelect.options[i];
                if (currentLang === 'es' && opt.text === 'Desempenho') opt.text = 'Rendimiento';
                if (currentLang === 'en' && opt.text === 'Desempenho') opt.text = 'Performance';
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
