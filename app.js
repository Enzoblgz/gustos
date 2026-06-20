'use strict';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== STORE =====
const Store = {
  get() { try { return JSON.parse(localStorage.getItem('recettes_v1') || '[]'); } catch { return []; } },
  save(r) { localStorage.setItem('recettes_v1', JSON.stringify(r)); },
  saveCache(r) { localStorage.setItem('recettes_v1', JSON.stringify(r)); },
  clear() { localStorage.removeItem('recettes_v1'); },
  add(r) { const a = this.get(); a.push(r); this.save(a); },
  update(id, d) { const a = this.get(), i = a.findIndex(r => r.id === id); if (i !== -1) { a[i] = { ...a[i], ...d }; this.save(a); } },
  delete(id) { this.save(this.get().filter(r => r.id !== id)); },
  byId(id) { return this.get().find(r => r.id === id) || null; }
};

// ===== CONSTANTS =====
const CATEGORIES = ['Entrées','Plats','Pâtes','Soupes','Salades','Desserts','Pâtisseries','Viandes','Poissons','Végétarien','Snacks','Boissons'];
const UNITS = ['g','kg','ml','cl','L','cuil. à café','cuil. à soupe','pincée','tasse','pièce(s)','botte(s)','tranche(s)','filet(s)','gousse(s)','sachet(s)'];
const CAT_EMOJI = {'Entrées':'🥗','Plats':'🍽️','Pâtes':'🍝','Soupes':'🍲','Salades':'🥙','Desserts':'🍰','Pâtisseries':'🧁','Viandes':'🥩','Poissons':'🐟','Végétarien':'🥦','Snacks':'🥪','Boissons':'🥤'};
const FREE_LIMIT = 10;
const ALL_CAT = '__all__';

// ===== LANG META =====
const LANG_META = {
  fr: { flag: '🇫🇷', name: 'Français' },
  en: { flag: '🇬🇧', name: 'English' },
  de: { flag: '🇩🇪', name: 'Deutsch' },
  es: { flag: '🇪🇸', name: 'Español' },
  it: { flag: '🇮🇹', name: 'Italiano' },
};

// ===== TRANSLATIONS =====
const TR = {
  fr: {
    newRecipe: '+ Nouvelle recette', search: 'Rechercher une recette, un ingrédient, un tag…',
    myAccount: 'Mon compte', logout: 'Se déconnecter', adminPanel: 'Admin',
    appTitle: 'Gustos', appSubtitle: 'Un carnet de recettes partagé pour simplifier les recettes du quotidien',
    login: 'Connexion', register: 'Nouveau compte',
    email: 'Email', password: 'Mot de passe', passwordConfirm: 'Confirmer',
    emailPh: 'toi@exemple.com', passPh: '••••••••',
    signIn: 'Se connecter', createAccount: 'Créer mon compte', loading: 'Chargement…',
    firstName: 'Prénom', firstNamePh: 'Ton prénom',
    forgotPw: 'Mot de passe oublié ?', trialNote: '✨ Gratuit et instantané — aucune carte requise',
    emailSent: 'Email de réinitialisation envoyé !', enterEmail: 'Entre ton email d\'abord.',
    accountCreated: 'Compte créé ! Vérifie ton email.',
    heroGreeting: 'Bonjour', heroSearchPh: 'Chercher une recette, un ingrédient, un tag…',
    heroTitle: 'Qu\'est-ce qu\'on cuisine <em>aujourd\'hui</em> ?', heroSub: 'Ajuste les portions en un clic — les quantités s\'adaptent automatiquement.',
    statRecipes: 'Recettes', statCats: 'Catégories', statAvg: 'Min. en moy.',
    allCat: 'Tout', allRecipesLabel: 'Toutes les recettes',
    searchResults: (n,q) => `${n} résultat${n!==1?'s':''} pour « ${q} »`,
    noResults: 'Aucun résultat', noResultsSub: 'Essaie un autre terme.',
    noRecipes: 'Aucune recette pour l\'instant', noRecipesSub: 'Clique sur « + Nouvelle recette » pour commencer.',
    noCat: 'Sans catégorie', persons: n => `${n} pers.`, ingrs: n => `${n} ingr.`,
    back: '← Retour', edit: 'Modifier', delete: 'Supprimer', deleteConfirm: 'Supprimer cette recette ?',
    prep: 'Préparation', cook: 'Cuisson', total: 'Total',
    like: 'J\'aime', save: 'Sauvegarder', saved: 'Sauvegardée',
    adjustPortions: 'Ajuster les portions',
    base: n => `Base : ${n} personne${n>1?'s':''}`, person: n => `personne${n>1?'s':''}`,
    ingsTitle: 'Ingrédients', stepsTitle: 'Préparation',
    myRecipes: 'Mes recettes', liked: '❤️ Aimées', bookmarked: '🔖 Sauvegardées',
    statCreated: 'Recettes créées', statLiked: 'Aimées ❤️', statSaved: 'Sauvegardées 🔖', statLikesRx: 'Likes reçus',
    trialDays: n => `Essai — ${n} jours restants`, freePlan: 'Plan gratuit', upgradeBtn: 'Passer Pro →',
    disconnectBtn: '↩ Déconnexion',
    noLiked: 'Aucune recette aimée', noSaved: 'Aucune recette sauvegardée', noRecipesAcc: 'Aucune recette',
    createFirst: 'Crée ta première recette !', exploreHint: 'Explore tes recettes et ajoute des ❤️ ou des 🔖',
    newRecipeTitle: 'Nouvelle recette', editRecipeTitle: 'Modifier la recette',
    generalInfo: 'Informations générales', nameLbl: 'Nom *', namePh: 'Ex : Tarte tatin',
    catLbl: 'Catégorie', chooseCat: 'Choisir…', portionsLbl: 'Portions de base',
    prepLbl: 'Préparation (min)', cookLbl: 'Cuisson (min)', descLbl: 'Description',
    coverTitle: 'Photo de couverture', coverHint: 'Miniature affichée sur la carte et en haut de la recette.',
    coverAdd: 'Ajouter la photo de couverture', coverOne: '1 seule photo — la miniature',
    coverChange: 'Changer', coverRm: 'Supprimer',
    ingsLbl: 'Ingrédients', dragHint: 'Glisse ⠿ pour réordonner.',
    ingNamePh: 'Ex : Farine', ingQtyPh: '200', addIng: 'Ajouter un ingrédient…',
    stepsLbl: 'Étapes de préparation',
    dynHelper: '💡 <strong>Quantités dynamiques</strong> — écris <code>{nom}</code> dans une étape.',
    stepPh: 'Décris cette étape… {Nom} pour les quantités.', addStep: '+ Ajouter une étape', addStepPhoto: '📷 Ajouter une photo',
    tagsLbl: 'Tags', tagsInputLbl: 'Mots-clés — Entrée ou virgule', tagsPh: 'végétarien, rapide…',
    cancelBtn: 'Annuler', saveBtn: 'Enregistrer', createBtn: 'Créer la recette', deleteBtn: 'Supprimer',
    nameWarn: '⚠️ Ajoute un nom à la recette.',
    recipeUpdated: 'Recette mise à jour !', recipeCreated: 'Recette créée !', recipeDeleted: 'Recette supprimée.',
    syncErr: '⚠️ Erreur sync : ',
    limitTitle: 'Limite atteinte',
    limitText: n => `Tu as atteint les <strong>${n} recettes</strong> du plan gratuit.`,
    limitText2: 'Passe au plan <strong>Pro</strong> pour un accès illimité.',
    upgradeProBtn: 'Passer Pro — bientôt disponible', laterBtn: 'Pas maintenant', comingSoon: 'Bientôt disponible !',
    planningBtn: 'Planning', editProfileTitle: 'Modifier le profil', changePhoto: 'Changer la photo',
    displayNameLbl: 'Prénom / Nom affiché', deleteAccount: 'Supprimer le compte',
    planningCtaTitle: 'Planning de la semaine',
    planningCtaSub: 'Organise tes repas et génère ta liste de courses automatiquement.',
    openPlanner: 'Ouvrir →', plannerTitle: 'Planning de la semaine',
    lunch: '☀️ Déjeuner', dinner: '🌙 Dîner',
    shoppingTitle: '🛒 Liste de courses', clearChecked: 'Supprimer cochés', refreshList: '↺ Actualiser',
    shoppingEmpty: 'Ajoute des repas dans le planning — la liste se génère automatiquement.',
    shopGroupAuto: 'Ingrédients des recettes', shopGroupManual: 'Ajouts manuels',
    addItemPh: 'Ajouter un article…', addItemBtn: '+ Ajouter', newItemBadge: 'Nouveau',
    viewRecipeTip: 'Voir la recette', profileSaved: 'Profil mis à jour !',
    emailConfirmSent: 'Email : un lien de confirmation a été envoyé.',
    deleteAccountTitle: 'Supprimer le compte',
    deleteAccountDesc: 'Cette action est <strong>irréversible</strong>. Toutes tes recettes, likes et données seront définitivement supprimés.',
    deleteConfirmWord: 'SUPPRIMER', deleteConfirmPrompt: 'Tape <strong>SUPPRIMER</strong> pour confirmer :',
    deleteForever: 'Supprimer définitivement',
    authErrCredentials: 'Email ou mot de passe incorrect.',
    authErrConfirm: 'Confirme ton email avant de te connecter.',
    authErrExists: 'Un compte existe déjà avec cet email.',
    authErrPassword: 'Le mot de passe doit faire au moins 6 caractères.',
    authErrRateLimit: 'Trop de tentatives. Réessaie dans quelques minutes.',
    adminUsers: n => `Admin — ${n} utilisateur${n!==1?'s':''}`,
    adminAccounts: 'Comptes', adminTrial: 'En essai',
    adminColEmail: 'Email', adminColPlan: 'Plan', adminColTrialCol: 'Essai',
    adminColRecipes: 'Recettes', adminColJoined: 'Inscription', adminColAction: 'Action',
    adminPlanUpdated: 'Plan mis à jour.', adminErr: e => `Erreur admin : ${e}`,
  },
  en: {
    newRecipe: '+ New recipe', search: 'Search a recipe, ingredient, tag…',
    myAccount: 'My account', logout: 'Sign out', adminPanel: 'Admin',
    appTitle: 'Gustos', appSubtitle: 'A shared recipe notebook to simplify everyday cooking',
    login: 'Sign in', register: 'New account',
    email: 'Email', password: 'Password', passwordConfirm: 'Confirm',
    emailPh: 'you@example.com', passPh: '••••••••',
    signIn: 'Sign in', createAccount: 'Create account', loading: 'Loading…',
    firstName: 'First name', firstNamePh: 'Your name',
    forgotPw: 'Forgot password?', trialNote: '✨ Free and instant — no card required',
    emailSent: 'Reset email sent!', enterEmail: 'Enter your email first.',
    accountCreated: 'Account created! Check your email.',
    heroGreeting: 'Hello', heroSearchPh: 'Search a recipe, an ingredient, a tag…',
    heroTitle: 'What are we <em>cooking</em> today?', heroSub: 'Adjust servings in one click — quantities update automatically.',
    statRecipes: 'Recipes', statCats: 'Categories', statAvg: 'Avg. min.',
    allCat: 'All', allRecipesLabel: 'All recipes',
    searchResults: (n,q) => `${n} result${n!==1?'s':''} for « ${q} »`,
    noResults: 'No results', noResultsSub: 'Try another term.',
    noRecipes: 'No recipes yet', noRecipesSub: 'Click "+ New recipe" to get started.',
    noCat: 'Uncategorized', persons: n => `${n} serv.`, ingrs: n => `${n} ingr.`,
    back: '← Back', edit: 'Edit', delete: 'Delete', deleteConfirm: 'Delete this recipe?',
    prep: 'Prep', cook: 'Cook', total: 'Total',
    like: 'Like', save: 'Save', saved: 'Saved',
    adjustPortions: 'Adjust servings',
    base: n => `Base: ${n} serving${n>1?'s':''}`, person: n => `serving${n>1?'s':''}`,
    ingsTitle: 'Ingredients', stepsTitle: 'Preparation',
    myRecipes: 'My recipes', liked: '❤️ Liked', bookmarked: '🔖 Saved',
    statCreated: 'Created', statLiked: 'Liked ❤️', statSaved: 'Saved 🔖', statLikesRx: 'Likes received',
    trialDays: n => `Trial — ${n} days left`, freePlan: 'Free plan', upgradeBtn: 'Go Pro →',
    disconnectBtn: '↩ Sign out',
    noLiked: 'No liked recipes', noSaved: 'No saved recipes', noRecipesAcc: 'No recipes',
    createFirst: 'Create your first recipe!', exploreHint: 'Explore your recipes and add ❤️ or 🔖',
    newRecipeTitle: 'New recipe', editRecipeTitle: 'Edit recipe',
    generalInfo: 'General information', nameLbl: 'Name *', namePh: 'E.g. Apple pie',
    catLbl: 'Category', chooseCat: 'Choose…', portionsLbl: 'Base servings',
    prepLbl: 'Prep time (min)', cookLbl: 'Cook time (min)', descLbl: 'Description',
    coverTitle: 'Cover photo', coverHint: 'Thumbnail shown on card and at the top of the recipe.',
    coverAdd: 'Add cover photo', coverOne: '1 photo only — the thumbnail',
    coverChange: 'Change', coverRm: 'Remove',
    ingsLbl: 'Ingredients', dragHint: 'Drag ⠿ to reorder.',
    ingNamePh: 'E.g. Flour', ingQtyPh: '200', addIng: 'Add an ingredient…',
    stepsLbl: 'Preparation steps',
    dynHelper: '💡 <strong>Dynamic quantities</strong> — write <code>{name}</code> in a step.',
    stepPh: 'Describe this step… {Name} for quantities.', addStep: '+ Add step', addStepPhoto: '📷 Add photo',
    tagsLbl: 'Tags', tagsInputLbl: 'Keywords — Enter or comma', tagsPh: 'vegetarian, quick…',
    cancelBtn: 'Cancel', saveBtn: 'Save', createBtn: 'Create recipe', deleteBtn: 'Delete',
    nameWarn: '⚠️ Add a name to the recipe.',
    recipeUpdated: 'Recipe updated!', recipeCreated: 'Recipe created!', recipeDeleted: 'Recipe deleted.',
    syncErr: '⚠️ Sync error: ',
    limitTitle: 'Limit reached',
    limitText: n => `You've reached the <strong>${n} recipes</strong> free plan limit.`,
    limitText2: 'Upgrade to <strong>Pro</strong> for unlimited access.',
    upgradeProBtn: 'Go Pro — coming soon', laterBtn: 'Not now', comingSoon: 'Coming soon!',
    planningBtn: 'Planning', editProfileTitle: 'Edit profile', changePhoto: 'Change photo',
    displayNameLbl: 'Display name', deleteAccount: 'Delete account',
    planningCtaTitle: 'Weekly planner',
    planningCtaSub: 'Organise your meals and auto-generate your shopping list.',
    openPlanner: 'Open →', plannerTitle: 'Weekly planner',
    lunch: '☀️ Lunch', dinner: '🌙 Dinner',
    shoppingTitle: '🛒 Shopping list', clearChecked: 'Clear checked', refreshList: '↺ Refresh',
    shoppingEmpty: 'Add meals to the planner — the list generates automatically.',
    shopGroupAuto: 'Recipe ingredients', shopGroupManual: 'Manual items',
    addItemPh: 'Add an item…', addItemBtn: '+ Add', newItemBadge: 'New',
    viewRecipeTip: 'View recipe', profileSaved: 'Profile updated!',
    emailConfirmSent: 'Email: a confirmation link has been sent.',
    deleteAccountTitle: 'Delete account',
    deleteAccountDesc: 'This action is <strong>irreversible</strong>. All your recipes, likes and data will be permanently deleted.',
    deleteConfirmWord: 'DELETE', deleteConfirmPrompt: 'Type <strong>DELETE</strong> to confirm:',
    deleteForever: 'Delete permanently',
    authErrCredentials: 'Incorrect email or password.',
    authErrConfirm: 'Confirm your email before signing in.',
    authErrExists: 'An account already exists with this email.',
    authErrPassword: 'Password must be at least 6 characters.',
    authErrRateLimit: 'Too many attempts. Try again in a few minutes.',
    adminUsers: n => `Admin — ${n} user${n!==1?'s':''}`,
    adminAccounts: 'Accounts', adminTrial: 'Trial',
    adminColEmail: 'Email', adminColPlan: 'Plan', adminColTrialCol: 'Trial',
    adminColRecipes: 'Recipes', adminColJoined: 'Joined', adminColAction: 'Action',
    adminPlanUpdated: 'Plan updated.', adminErr: e => `Admin error: ${e}`,
  },
  es: {
    newRecipe: '+ Nueva receta', search: 'Buscar una receta, ingrediente, etiqueta…',
    myAccount: 'Mi cuenta', logout: 'Cerrar sesión', adminPanel: 'Admin',
    appTitle: 'Gustos', appSubtitle: 'Un cuaderno de recetas compartido para simplificar las recetas del día a día',
    login: 'Iniciar sesión', register: 'Nueva cuenta',
    email: 'Email', password: 'Contraseña', passwordConfirm: 'Confirmar',
    emailPh: 'tu@ejemplo.com', passPh: '••••••••',
    signIn: 'Iniciar sesión', createAccount: 'Crear cuenta', loading: 'Cargando…',
    firstName: 'Nombre', firstNamePh: 'Tu nombre',
    forgotPw: '¿Olvidaste tu contraseña?', trialNote: '✨ Gratis e instantáneo — sin tarjeta',
    emailSent: '¡Email de restablecimiento enviado!', enterEmail: 'Introduce tu email primero.',
    accountCreated: '¡Cuenta creada! Revisa tu email.',
    heroGreeting: 'Hola', heroSearchPh: 'Buscar receta, ingrediente, etiqueta…',
    heroTitle: '¿Qué <em>cocinamos</em> hoy?', heroSub: 'Ajusta las porciones con un clic — las cantidades se adaptan automáticamente.',
    statRecipes: 'Recetas', statCats: 'Categorías', statAvg: 'Min. promedio',
    allCat: 'Todo', allRecipesLabel: 'Todas las recetas',
    searchResults: (n,q) => `${n} resultado${n!==1?'s':''} para « ${q} »`,
    noResults: 'Sin resultados', noResultsSub: 'Prueba otro término.',
    noRecipes: 'Todavía no hay recetas', noRecipesSub: 'Haz clic en "+ Nueva receta" para empezar.',
    noCat: 'Sin categoría', persons: n => `${n} pers.`, ingrs: n => `${n} ingr.`,
    back: '← Volver', edit: 'Editar', delete: 'Eliminar', deleteConfirm: '¿Eliminar esta receta?',
    prep: 'Preparación', cook: 'Cocción', total: 'Total',
    like: 'Me gusta', save: 'Guardar', saved: 'Guardada',
    adjustPortions: 'Ajustar porciones',
    base: n => `Base: ${n} porción${n>1?'es':''}`, person: n => `porción${n>1?'es':''}`,
    ingsTitle: 'Ingredientes', stepsTitle: 'Preparación',
    myRecipes: 'Mis recetas', liked: '❤️ Me gusta', bookmarked: '🔖 Guardadas',
    statCreated: 'Recetas creadas', statLiked: 'Me gusta ❤️', statSaved: 'Guardadas 🔖', statLikesRx: 'Likes recibidos',
    trialDays: n => `Prueba — ${n} días restantes`, freePlan: 'Plan gratuito', upgradeBtn: 'Ir a Pro →',
    disconnectBtn: '↩ Cerrar sesión',
    noLiked: 'Sin recetas favoritas', noSaved: 'Sin recetas guardadas', noRecipesAcc: 'Sin recetas',
    createFirst: '¡Crea tu primera receta!', exploreHint: 'Explora tus recetas y añade ❤️ o 🔖',
    newRecipeTitle: 'Nueva receta', editRecipeTitle: 'Editar receta',
    generalInfo: 'Información general', nameLbl: 'Nombre *', namePh: 'Ej: Tarta de manzana',
    catLbl: 'Categoría', chooseCat: 'Elegir…', portionsLbl: 'Porciones base',
    prepLbl: 'Preparación (min)', cookLbl: 'Cocción (min)', descLbl: 'Descripción',
    coverTitle: 'Foto de portada', coverHint: 'Miniatura mostrada en la tarjeta y al inicio de la receta.',
    coverAdd: 'Añadir foto de portada', coverOne: '1 sola foto — la miniatura',
    coverChange: 'Cambiar', coverRm: 'Eliminar',
    ingsLbl: 'Ingredientes', dragHint: 'Arrastra ⠿ para reordenar.',
    ingNamePh: 'Ej: Harina', ingQtyPh: '200', addIng: 'Añadir ingrediente…',
    stepsLbl: 'Pasos de preparación',
    dynHelper: '💡 <strong>Cantidades dinámicas</strong> — escribe <code>{nombre}</code> en un paso.',
    stepPh: 'Describe este paso… {Nombre} para las cantidades.', addStep: '+ Añadir paso', addStepPhoto: '📷 Añadir foto',
    tagsLbl: 'Etiquetas', tagsInputLbl: 'Palabras clave — Enter o coma', tagsPh: 'vegetariano, rápido…',
    cancelBtn: 'Cancelar', saveBtn: 'Guardar', createBtn: 'Crear receta', deleteBtn: 'Eliminar',
    nameWarn: '⚠️ Añade un nombre a la receta.',
    recipeUpdated: '¡Receta actualizada!', recipeCreated: '¡Receta creada!', recipeDeleted: 'Receta eliminada.',
    syncErr: '⚠️ Error de sincronización: ',
    limitTitle: 'Límite alcanzado',
    limitText: n => `Has alcanzado el límite de <strong>${n} recetas</strong> del plan gratuito.`,
    limitText2: 'Pasa al plan <strong>Pro</strong> para acceso ilimitado.',
    upgradeProBtn: 'Ir a Pro — próximamente', laterBtn: 'Ahora no', comingSoon: '¡Próximamente!',
    planningBtn: 'Planificación', editProfileTitle: 'Editar perfil', changePhoto: 'Cambiar foto',
    displayNameLbl: 'Nombre visible', deleteAccount: 'Eliminar cuenta',
    planningCtaTitle: 'Planificador semanal',
    planningCtaSub: 'Organiza tus comidas y genera tu lista de la compra automáticamente.',
    openPlanner: 'Abrir →', plannerTitle: 'Planificador semanal',
    lunch: '☀️ Almuerzo', dinner: '🌙 Cena',
    shoppingTitle: '🛒 Lista de la compra', clearChecked: 'Eliminar seleccionados', refreshList: '↺ Actualizar',
    shoppingEmpty: 'Añade comidas al planificador — la lista se genera automáticamente.',
    shopGroupAuto: 'Ingredientes de las recetas', shopGroupManual: 'Artículos manuales',
    addItemPh: 'Añadir un artículo…', addItemBtn: '+ Añadir', newItemBadge: 'Nuevo',
    viewRecipeTip: 'Ver la receta', profileSaved: '¡Perfil actualizado!',
    emailConfirmSent: 'Email: se ha enviado un enlace de confirmación.',
    deleteAccountTitle: 'Eliminar cuenta',
    deleteAccountDesc: 'Esta acción es <strong>irreversible</strong>. Todas tus recetas, likes y datos serán eliminados permanentemente.',
    deleteConfirmWord: 'ELIMINAR', deleteConfirmPrompt: 'Escribe <strong>ELIMINAR</strong> para confirmar:',
    deleteForever: 'Eliminar definitivamente',
    authErrCredentials: 'Email o contraseña incorrectos.',
    authErrConfirm: 'Confirma tu email antes de iniciar sesión.',
    authErrExists: 'Ya existe una cuenta con este email.',
    authErrPassword: 'La contraseña debe tener al menos 6 caracteres.',
    authErrRateLimit: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
    adminUsers: n => `Admin — ${n} usuario${n!==1?'s':''}`,
    adminAccounts: 'Cuentas', adminTrial: 'En prueba',
    adminColEmail: 'Email', adminColPlan: 'Plan', adminColTrialCol: 'Prueba',
    adminColRecipes: 'Recetas', adminColJoined: 'Registro', adminColAction: 'Acción',
    adminPlanUpdated: 'Plan actualizado.', adminErr: e => `Error admin: ${e}`,
  },
  it: {
    newRecipe: '+ Nuova ricetta', search: 'Cerca una ricetta, ingrediente, tag…',
    myAccount: 'Il mio account', logout: 'Disconnetti', adminPanel: 'Admin',
    appTitle: 'Gustos', appSubtitle: 'Un quaderno di ricette condiviso per semplificare le ricette quotidiane',
    login: 'Accedi', register: 'Nuovo account',
    email: 'Email', password: 'Password', passwordConfirm: 'Conferma',
    emailPh: 'tu@esempio.com', passPh: '••••••••',
    signIn: 'Accedi', createAccount: 'Crea account', loading: 'Caricamento…',
    firstName: 'Nome', firstNamePh: 'Il tuo nome',
    forgotPw: 'Password dimenticata?', trialNote: '✨ Gratuito e istantaneo — nessuna carta richiesta',
    emailSent: 'Email di reimpostazione inviata!', enterEmail: 'Inserisci prima la tua email.',
    accountCreated: 'Account creato! Controlla la tua email.',
    heroGreeting: 'Ciao', heroSearchPh: 'Cerca una ricetta, un ingrediente, un tag…',
    heroTitle: 'Cosa <em>cuciniamo</em> oggi?', heroSub: 'Regola le porzioni con un clic — le quantità si adattano automaticamente.',
    statRecipes: 'Ricette', statCats: 'Categorie', statAvg: 'Min. medi',
    allCat: 'Tutto', allRecipesLabel: 'Tutte le ricette',
    searchResults: (n,q) => `${n} risultat${n!==1?'i':'o'} per « ${q} »`,
    noResults: 'Nessun risultato', noResultsSub: 'Prova un altro termine.',
    noRecipes: 'Ancora nessuna ricetta', noRecipesSub: 'Clicca "+ Nuova ricetta" per iniziare.',
    noCat: 'Senza categoria', persons: n => `${n} pers.`, ingrs: n => `${n} ingr.`,
    back: '← Indietro', edit: 'Modifica', delete: 'Elimina', deleteConfirm: 'Eliminare questa ricetta?',
    prep: 'Preparazione', cook: 'Cottura', total: 'Totale',
    like: 'Mi piace', save: 'Salva', saved: 'Salvata',
    adjustPortions: 'Regola le porzioni',
    base: n => `Base: ${n} person${n>1?'e':'a'}`, person: n => `person${n>1?'e':'a'}`,
    ingsTitle: 'Ingredienti', stepsTitle: 'Preparazione',
    myRecipes: 'Le mie ricette', liked: '❤️ Preferite', bookmarked: '🔖 Salvate',
    statCreated: 'Ricette create', statLiked: 'Preferite ❤️', statSaved: 'Salvate 🔖', statLikesRx: 'Like ricevuti',
    trialDays: n => `Prova — ${n} giorni rimasti`, freePlan: 'Piano gratuito', upgradeBtn: 'Passa a Pro →',
    disconnectBtn: '↩ Disconnetti',
    noLiked: 'Nessuna ricetta preferita', noSaved: 'Nessuna ricetta salvata', noRecipesAcc: 'Nessuna ricetta',
    createFirst: 'Crea la tua prima ricetta!', exploreHint: 'Esplora le tue ricette e aggiungi ❤️ o 🔖',
    newRecipeTitle: 'Nuova ricetta', editRecipeTitle: 'Modifica ricetta',
    generalInfo: 'Informazioni generali', nameLbl: 'Nome *', namePh: 'Es: Torta di mele',
    catLbl: 'Categoria', chooseCat: 'Scegli…', portionsLbl: 'Porzioni base',
    prepLbl: 'Preparazione (min)', cookLbl: 'Cottura (min)', descLbl: 'Descrizione',
    coverTitle: 'Foto di copertina', coverHint: 'Miniatura mostrata sulla scheda e in cima alla ricetta.',
    coverAdd: 'Aggiungi foto di copertina', coverOne: '1 sola foto — la miniatura',
    coverChange: 'Cambia', coverRm: 'Rimuovi',
    ingsLbl: 'Ingredienti', dragHint: 'Trascina ⠿ per riordinare.',
    ingNamePh: 'Es: Farina', ingQtyPh: '200', addIng: 'Aggiungi ingrediente…',
    stepsLbl: 'Fasi di preparazione',
    dynHelper: '💡 <strong>Quantità dinamiche</strong> — scrivi <code>{nome}</code> in un passaggio.',
    stepPh: 'Descrivi questo passaggio… {Nome} per le quantità.', addStep: '+ Aggiungi passaggio', addStepPhoto: '📷 Aggiungi foto',
    tagsLbl: 'Tag', tagsInputLbl: 'Parole chiave — Invio o virgola', tagsPh: 'vegetariano, veloce…',
    cancelBtn: 'Annulla', saveBtn: 'Salva', createBtn: 'Crea ricetta', deleteBtn: 'Elimina',
    nameWarn: '⚠️ Aggiungi un nome alla ricetta.',
    recipeUpdated: 'Ricetta aggiornata!', recipeCreated: 'Ricetta creata!', recipeDeleted: 'Ricetta eliminata.',
    syncErr: '⚠️ Errore di sincronizzazione: ',
    limitTitle: 'Limite raggiunto',
    limitText: n => `Hai raggiunto il limite di <strong>${n} ricette</strong> del piano gratuito.`,
    limitText2: 'Passa al piano <strong>Pro</strong> per accesso illimitato.',
    upgradeProBtn: 'Passa a Pro — prossimamente', laterBtn: 'Non ora', comingSoon: 'Prossimamente!',
    planningBtn: 'Pianificazione', editProfileTitle: 'Modifica profilo', changePhoto: 'Cambia foto',
    displayNameLbl: 'Nome visualizzato', deleteAccount: 'Elimina account',
    planningCtaTitle: 'Pianificatore settimanale',
    planningCtaSub: 'Organizza i tuoi pasti e genera automaticamente la lista della spesa.',
    openPlanner: 'Apri →', plannerTitle: 'Pianificatore settimanale',
    lunch: '☀️ Pranzo', dinner: '🌙 Cena',
    shoppingTitle: '🛒 Lista della spesa', clearChecked: 'Elimina selezionati', refreshList: '↺ Aggiorna',
    shoppingEmpty: 'Aggiungi pasti al pianificatore — la lista si genera automaticamente.',
    shopGroupAuto: 'Ingredienti delle ricette', shopGroupManual: 'Voci manuali',
    addItemPh: 'Aggiungi un articolo…', addItemBtn: '+ Aggiungi', newItemBadge: 'Nuovo',
    viewRecipeTip: 'Vedi ricetta', profileSaved: 'Profilo aggiornato!',
    emailConfirmSent: 'Email: è stato inviato un link di conferma.',
    deleteAccountTitle: 'Elimina account',
    deleteAccountDesc: 'Questa azione è <strong>irreversibile</strong>. Tutte le tue ricette, like e dati saranno eliminati definitivamente.',
    deleteConfirmWord: 'ELIMINA', deleteConfirmPrompt: 'Scrivi <strong>ELIMINA</strong> per confermare:',
    deleteForever: 'Elimina definitivamente',
    authErrCredentials: 'Email o password non corretti.',
    authErrConfirm: 'Conferma la tua email prima di accedere.',
    authErrExists: 'Esiste già un account con questa email.',
    authErrPassword: 'La password deve avere almeno 6 caratteri.',
    authErrRateLimit: 'Troppi tentativi. Riprova tra qualche minuto.',
    adminUsers: n => `Admin — ${n} utente${n!==1?'i':''}`,
    adminAccounts: 'Account', adminTrial: 'In prova',
    adminColEmail: 'Email', adminColPlan: 'Piano', adminColTrialCol: 'Prova',
    adminColRecipes: 'Ricette', adminColJoined: 'Iscrizione', adminColAction: 'Azione',
    adminPlanUpdated: 'Piano aggiornato.', adminErr: e => `Errore admin: ${e}`,
  },
  de: {
    newRecipe: '+ Neues Rezept', search: 'Rezept, Zutat oder Tag suchen…',
    myAccount: 'Mein Konto', logout: 'Abmelden', adminPanel: 'Admin',
    appTitle: 'Gustos', appSubtitle: 'Ein geteiltes Rezeptheft für den Alltag',
    login: 'Anmelden', register: 'Neues Konto',
    email: 'E-Mail', password: 'Passwort', passwordConfirm: 'Bestätigen',
    emailPh: 'du@beispiel.de', passPh: '••••••••',
    signIn: 'Anmelden', createAccount: 'Konto erstellen', loading: 'Lädt…',
    firstName: 'Vorname', firstNamePh: 'Dein Vorname',
    forgotPw: 'Passwort vergessen?', trialNote: '✨ Kostenlos und sofort — keine Karte nötig',
    emailSent: 'Zurücksetz-E-Mail gesendet!', enterEmail: 'Gib zuerst deine E-Mail ein.',
    accountCreated: 'Konto erstellt! Überprüfe deine E-Mail.',
    heroGreeting: 'Hallo', heroSearchPh: 'Rezept, Zutat oder Tag suchen…',
    heroTitle: 'Was kochen wir <em>heute</em>?', heroSub: 'Portionen per Klick anpassen — Mengen aktualisieren sich automatisch.',
    statRecipes: 'Rezepte', statCats: 'Kategorien', statAvg: 'Min. Ø',
    allCat: 'Alle', allRecipesLabel: 'Alle Rezepte',
    searchResults: (n,q) => `${n} Ergebnis${n!==1?'se':''} für « ${q} »`,
    noResults: 'Keine Ergebnisse', noResultsSub: 'Versuche einen anderen Begriff.',
    noRecipes: 'Noch keine Rezepte', noRecipesSub: 'Klicke auf „+ Neues Rezept" um zu beginnen.',
    noCat: 'Ohne Kategorie', persons: n => `${n} Pers.`, ingrs: n => `${n} Zut.`,
    back: '← Zurück', edit: 'Bearbeiten', delete: 'Löschen', deleteConfirm: 'Dieses Rezept löschen?',
    prep: 'Vorbereitung', cook: 'Kochzeit', total: 'Gesamt',
    like: 'Gefällt mir', save: 'Speichern', saved: 'Gespeichert',
    adjustPortions: 'Portionen anpassen',
    base: n => `Basis: ${n} Portion${n>1?'en':''}`, person: n => `Portion${n>1?'en':''}`,
    ingsTitle: 'Zutaten', stepsTitle: 'Zubereitung',
    myRecipes: 'Meine Rezepte', liked: '❤️ Gemocht', bookmarked: '🔖 Gespeichert',
    statCreated: 'Erstellt', statLiked: 'Gemocht ❤️', statSaved: 'Gespeichert 🔖', statLikesRx: 'Erhaltene Likes',
    trialDays: n => `Test — noch ${n} Tag${n!==1?'e':''}`, freePlan: 'Gratisplan', upgradeBtn: 'Zu Pro →',
    disconnectBtn: '↩ Abmelden',
    noLiked: 'Keine gemochten Rezepte', noSaved: 'Keine gespeicherten Rezepte', noRecipesAcc: 'Keine Rezepte',
    createFirst: 'Erstelle dein erstes Rezept!', exploreHint: 'Entdecke Rezepte und füge ❤️ oder 🔖 hinzu',
    newRecipeTitle: 'Neues Rezept', editRecipeTitle: 'Rezept bearbeiten',
    generalInfo: 'Allgemeine Infos', nameLbl: 'Name *', namePh: 'z.B. Apfelkuchen',
    catLbl: 'Kategorie', chooseCat: 'Wählen…', portionsLbl: 'Basisportionen',
    prepLbl: 'Vorbereitung (Min.)', cookLbl: 'Kochzeit (Min.)', descLbl: 'Beschreibung',
    coverTitle: 'Titelbild', coverHint: 'Miniatur auf der Karte und oben im Rezept.',
    coverAdd: 'Titelbild hinzufügen', coverOne: '1 Foto — die Miniatur',
    coverChange: 'Ändern', coverRm: 'Entfernen',
    ingsLbl: 'Zutaten', dragHint: 'Ziehe ⠿ zum Neuordnen.',
    ingNamePh: 'z.B. Mehl', ingQtyPh: '200', addIng: 'Zutat hinzufügen…',
    stepsLbl: 'Zubereitungsschritte',
    dynHelper: '💡 <strong>Dynamische Mengen</strong> — schreibe <code>{Name}</code> in einen Schritt.',
    stepPh: 'Beschreibe diesen Schritt… {Name} für Mengen.', addStep: '+ Schritt hinzufügen', addStepPhoto: '📷 Foto hinzufügen',
    tagsLbl: 'Tags', tagsInputLbl: 'Stichwörter — Enter oder Komma', tagsPh: 'vegetarisch, schnell…',
    cancelBtn: 'Abbrechen', saveBtn: 'Speichern', createBtn: 'Rezept erstellen', deleteBtn: 'Löschen',
    nameWarn: '⚠️ Gib dem Rezept einen Namen.',
    recipeUpdated: 'Rezept aktualisiert!', recipeCreated: 'Rezept erstellt!', recipeDeleted: 'Rezept gelöscht.',
    syncErr: '⚠️ Sync-Fehler: ',
    limitTitle: 'Limit erreicht',
    limitText: n => `Du hast das Limit von <strong>${n} Rezepten</strong> des Gratisplans erreicht.`,
    limitText2: 'Wechsle zum <strong>Pro</strong>-Plan für unbegrenzten Zugriff.',
    upgradeProBtn: 'Zu Pro — demnächst', laterBtn: 'Nicht jetzt', comingSoon: 'Demnächst!',
    planningBtn: 'Planung', editProfileTitle: 'Profil bearbeiten', changePhoto: 'Foto ändern',
    displayNameLbl: 'Anzeigename', deleteAccount: 'Konto löschen',
    planningCtaTitle: 'Wochenplaner',
    planningCtaSub: 'Organisiere deine Mahlzeiten und erstelle automatisch eine Einkaufsliste.',
    openPlanner: 'Öffnen →', plannerTitle: 'Wochenplaner',
    lunch: '☀️ Mittagessen', dinner: '🌙 Abendessen',
    shoppingTitle: '🛒 Einkaufsliste', clearChecked: 'Ausgewählte löschen', refreshList: '↺ Aktualisieren',
    shoppingEmpty: 'Füge Mahlzeiten zum Planer hinzu — die Liste wird automatisch erstellt.',
    shopGroupAuto: 'Rezeptzutaten', shopGroupManual: 'Manuelle Einträge',
    addItemPh: 'Artikel hinzufügen…', addItemBtn: '+ Hinzufügen', newItemBadge: 'Neu',
    viewRecipeTip: 'Rezept ansehen', profileSaved: 'Profil aktualisiert!',
    emailConfirmSent: 'E-Mail: Ein Bestätigungslink wurde gesendet.',
    deleteAccountTitle: 'Konto löschen',
    deleteAccountDesc: 'Diese Aktion ist <strong>unwiderruflich</strong>. Alle deine Rezepte, Likes und Daten werden dauerhaft gelöscht.',
    deleteConfirmWord: 'LÖSCHEN', deleteConfirmPrompt: 'Tippe <strong>LÖSCHEN</strong> zur Bestätigung:',
    deleteForever: 'Dauerhaft löschen',
    authErrCredentials: 'Falsche E-Mail oder falsches Passwort.',
    authErrConfirm: 'Bestätige deine E-Mail bevor du dich anmeldest.',
    authErrExists: 'Ein Konto mit dieser E-Mail existiert bereits.',
    authErrPassword: 'Das Passwort muss mindestens 6 Zeichen haben.',
    authErrRateLimit: 'Zu viele Versuche. Versuche es in ein paar Minuten erneut.',
    adminUsers: n => `Admin — ${n} Nutzer`,
    adminAccounts: 'Konten', adminTrial: 'Im Test',
    adminColEmail: 'E-Mail', adminColPlan: 'Plan', adminColTrialCol: 'Testphase',
    adminColRecipes: 'Rezepte', adminColJoined: 'Beigetreten', adminColAction: 'Aktion',
    adminPlanUpdated: 'Plan aktualisiert.', adminErr: e => `Admin-Fehler: ${e}`,
  }
};

// ===== APP =====
const App = {
  view: 'loading', user: null, authMode: 'login', authError: '',
  adminStats: null, currentId: null, searchQuery: '', activeCategory: ALL_CAT,
  portionCount: 4, editingId: null, formData: { ingredients: [], steps: [], coverImage: null, tags: [] },
  likedIds: new Set(), savedIds: new Set(), likeCounts: {}, accountTab: 'mine',
  lang: localStorage.getItem('recettes_lang') || 'fr',
  planWeek: '', plan: {}, planPortions: {}, shopping: [], pickerOpen: null, pickerQuery: '', pickerTab: 'all',
  navStack: [],

  t(key, ...args) {
    const d = TR[this.lang] || TR.fr;
    const v = d[key] ?? TR.fr[key];
    if (typeof v === 'function') return v(...args);
    return v ?? key;
  },

  async init() {
    this.view = 'loading'; this.render();
    this.planWeek = this.getWeekStart(new Date());
    try { this.plan = JSON.parse(localStorage.getItem('gustos_plan') || '{}'); } catch { this.plan = {}; }
    try { this.shopping = JSON.parse(localStorage.getItem('gustos_shopping') || '[]'); } catch { this.shopping = []; }
    // Tooltip global épingle — créé une fois, attaché au body (hors overflow:hidden)
    const _tip = document.createElement('div');
    _tip.id = '_save-tip'; _tip.className = 'save-tip-global';
    document.body.appendChild(_tip);
    this._saveTip = _tip;
    document.addEventListener('click', e => {
      if (e.target.closest('#btn-save-profile')) this.saveProfile();
      if (e.target.closest('#btn-add-ing')) {
        this._addIngFromInput();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.id === 'ing-add-input') {
        e.preventDefault();
        this._addIngFromInput();
      }
    });
    db.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session) await this.onSignIn(session.user);
        else { this.view = 'auth'; this.authError = ''; this.render(); }
      } else if (event === 'SIGNED_IN') {
        if (!this.user) await this.onSignIn(session.user);
      } else if (event === 'USER_UPDATED') {
        if (this.user && session?.user?.user_metadata?.full_name) {
          this.user.name = session.user.user_metadata.full_name;
        }
        if (this.user && session?.user?.email) this.user.email = session.user.email;
      } else if (event === 'SIGNED_OUT') {
        this.user = null; Store.clear();
        this.likedIds = new Set(); this.savedIds = new Set(); this.likeCounts = {};
        this.searchQuery = ''; this.activeCategory = ALL_CAT;
        this.view = 'auth'; this.authError = ''; this.render();
      }
    });
  },

  async onSignIn(authUser) {
    try {
      const { data: profile, error } = await db.from('profiles').select('*').eq('id', authUser.id).single();
      if (error) console.warn('[Auth]', error.message);
      this.user = profile || { id: authUser.id, email: authUser.email, role: 'user', plan: 'free', trial_ends_at: null };
      if (!this.user.name) this.user.name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || null;
      // Load avatar: Supabase first, localStorage fallback
      this.avatarImg = profile?.avatar_url || localStorage.getItem('gustos_avatar_' + authUser.id) || null;
      await this.syncRecipes().catch(e => console.warn('[Sync]', e));
      if (!localStorage.getItem('gustos_seeded_v2')) {
        await this.seedDefaultRecipes(true).catch(() => {});
        localStorage.setItem('gustos_seeded_v2', '1');
      }
      await this.loadSocial().catch(e => console.warn('[Social]', e));
      await this.loadPlan().catch(e => console.warn('[Plan]', e));
    } catch (e) {
      console.error('[onSignIn]', e);
    }
    // Check for post-reload instruction (e.g. after profile save)
    this.view = 'list'; this.render();
  },

  async syncRecipes() {
    if (!this.user) return;
    // Push local recipes to Supabase first (handles pre-table era + offline creates)
    const local = Store.get();
    if (local.length) {
      const { error: pushErr } = await db.from('recipes')
        .upsert(local.map(r => ({ id: r.id, user_id: this.user.id, data: r, updated_at: r.updatedAt || new Date().toISOString() })), { onConflict: 'id' });
      if (pushErr) console.error('[Sync push error]', pushErr.code, pushErr.message, pushErr.details);
    }
    // Fetch all recipes + author name from profiles (JOIN via FK)
    const { data, error } = await db.from('recipes').select('data, user_id, profiles(name, email)').order('created_at', { ascending: true });
    if (error) { console.warn('[Sync fetch]', error.message); return; }
    Store.saveCache(data ? data.map(r => ({
      ...r.data,
      authorId: r.user_id,
      authorName: r.data.authorName || r.profiles?.name || r.profiles?.email?.split('@')[0] || ''
    })) : local);
  },

  async loadSocial() {
    if (!this.user) return;
    const ids = Store.get().map(r => r.id);
    const [likedRes, savedRes] = await Promise.all([
      db.from('likes').select('recipe_id').eq('user_id', this.user.id),
      db.from('saves').select('recipe_id').eq('user_id', this.user.id)
    ]);
    this.likedIds = new Set((likedRes.data || []).map(l => l.recipe_id));
    this.savedIds = new Set((savedRes.data || []).map(s => s.recipe_id));
    if (ids.length) {
      const { data } = await db.from('likes').select('recipe_id').in('recipe_id', ids);
      this.likeCounts = {};
      (data || []).forEach(l => { this.likeCounts[l.recipe_id] = (this.likeCounts[l.recipe_id] || 0) + 1; });
    }
  },

  async toggleLike(id) {
    if (!this.user) return;
    const was = this.likedIds.has(id);
    if (was) { this.likedIds.delete(id); this.likeCounts[id] = Math.max(0, (this.likeCounts[id] || 1) - 1); }
    else { this.likedIds.add(id); this.likeCounts[id] = (this.likeCounts[id] || 0) + 1; }
    this.updateSocialUI(id);
    if (was) await db.from('likes').delete().eq('user_id', this.user.id).eq('recipe_id', id);
    else await db.from('likes').insert({ user_id: this.user.id, recipe_id: id });
  },

  async toggleSave(id) {
    if (!this.user) return;
    const was = this.savedIds.has(id);
    if (was) this.savedIds.delete(id); else this.savedIds.add(id);
    this.updateSocialUI(id);
    if (was) await db.from('saves').delete().eq('user_id', this.user.id).eq('recipe_id', id);
    else await db.from('saves').insert({ user_id: this.user.id, recipe_id: id });
  },

  updateSocialUI(id) {
    const likeBtn = document.querySelector(`[data-like="${id}"]`);
    if (likeBtn) {
      const liked = this.likedIds.has(id);
      likeBtn.classList.toggle('active', liked);
      likeBtn.querySelector('.si').textContent = liked ? '❤️' : '🤍';
      likeBtn.querySelector('.sc').textContent = this.likeCounts[id] || 0;
    }
    const saveBtn = document.querySelector(`[data-save="${id}"]`);
    if (saveBtn) {
      const saved = this.savedIds.has(id);
      saveBtn.classList.toggle('active', saved);
      saveBtn.querySelector('.si').textContent = saved ? '🔖' : '📌';
      saveBtn.querySelector('.sl').textContent = saved ? this.t('saved') : this.t('save');
    }
    document.querySelectorAll(`[data-save-card="${id}"]`).forEach(el => {
      el.classList.toggle('saved', this.savedIds.has(id));
      el.textContent = this.savedIds.has(id) ? '🔖' : '📌';
    });
    document.querySelectorAll(`[data-id="${id}"] .card-likes`).forEach(el => {
      const c = this.likeCounts[id] || 0;
      el.textContent = c ? `❤️ ${c}` : '';
      el.style.display = c ? '' : 'none';
    });
  },

  normalizeStep(s) { return typeof s === 'string' ? { text: s, image: null } : { text: s.text || '', image: s.image || null }; },
  getCover(r) { return r.coverImage || (r.images && r.images[0]) || null; },
  canAddRecipe() {
    if (!this.user) return false;
    if (this.user.role === 'admin' || this.user.plan === 'pro') return true;
    if (this.user.trial_ends_at && new Date(this.user.trial_ends_at) > new Date()) return true;
    return Store.get().length < FREE_LIMIT;
  },
  trialDaysLeft() {
    if (!this.user?.trial_ends_at) return 0;
    return Math.max(0, Math.ceil((new Date(this.user.trial_ends_at) - new Date()) / 86400000));
  },

  goBack() {
    const prev = this.navStack.pop();
    if (!prev) { this.view = 'list'; this.render(); return; }
    this.view = prev.view;
    if (prev.view === 'recipe') { this.currentId = prev.id; this.portionCount = prev.portions || 4; }
    if (prev.view === 'edit') {
      this.editingId = prev.editingId;
      const r = Store.byId(prev.editingId);
      if (r) this.formData = { ingredients: r.ingredients.map(i=>({...i})), steps: r.steps.map(s=>this.normalizeStep(s)), coverImage: this.getCover(r), tags: [...(r.tags||[])] };
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  },

  nav(view, id = null, opts = {}) {
    if (this.view !== 'loading' && this.view !== 'auth') {
      this.navStack.push({ view: this.view, id: this.currentId, portions: this.portionCount, editingId: this.editingId });
      if (this.navStack.length > 25) this.navStack.shift();
    }
    this.view = view;
    if (view === 'recipe') { this.currentId = id; const r = Store.byId(id); this.portionCount = opts.portions ?? (r ? r.basePeople : 4); }
    if (view === 'create') { this.editingId = null; this.formData = { ingredients: [], steps: [{ text:'',image:null }], coverImage: null, tags: [] }; }
    if (view === 'edit') {
      this.editingId = id; const r = Store.byId(id);
      if (r) this.formData = { ingredients: r.ingredients.map(i=>({...i})), steps: r.steps.map(s=>this.normalizeStep(s)), coverImage: this.getCover(r), tags: [...(r.tags||[])] };
    }
    if (view === 'planning') { this.pickerOpen = null; this.pickerQuery = ''; this.pickerTab = 'all'; }
    if (view === 'admin') {
      this.adminStats = null; this.render();
      db.rpc('get_admin_stats').then(({ data, error }) => {
        if (error) { this.toast('Erreur admin : ' + error.message); return; }
        this.adminStats = data || []; this.render();
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  },

  render() {
    const app = document.getElementById('app');
    if (this.view === 'loading') { app.innerHTML = this.renderLoading(); return; }
    if (this.view === 'auth') { app.innerHTML = this.renderAuth(); this.bindAuthEvents(); return; }
    app.innerHTML = this.renderHeader() + '<main>' + this.renderView() + '</main>';
    this.bindHeader(); this.bindContent();
  },
  renderContent() {
    const main = document.querySelector('#app main');
    if (!main) { this.render(); return; }
    main.innerHTML = this.renderView(); this.bindContent();
  },
  renderView() {
    if (this.view === 'recipe')  return this.renderRecipe();
    if (this.view === 'create' || this.view === 'edit') return this.renderForm();
    if (this.view === 'admin')   return this.renderAdminPanel();
    if (this.view === 'account') return this.renderAccount();
    if (this.view === 'planning') return this.renderMealPlanner();
    return this.renderList();
  },

  renderLoading() {
    return `<div class="view-loading"><div class="loading-spinner"></div><p class="loading-label">${this.t('loading')}</p></div>`;
  },

  renderAuth() {
    const isLogin = this.authMode === 'login';
    const langBar = Object.entries(LANG_META).map(([code, m]) =>
      `<button class="lang-option-auth${this.lang===code?' active':''}" data-lang-auth="${code}" title="${m.name}">
        <span class="lang-flag">${m.flag}</span>
      </button>`).join('');
    return `<div class="view-auth">
      <div class="auth-brand">
        <div class="auth-brand-logo">
          <img src="Images/gustos-logo-transparent-background.png" alt="" class="auth-brand-mark">
          <span>Gustos</span>
        </div>
        <div class="auth-brand-mascot">
          <img src="Images/gustos-logo-transparent-background.png" alt="Gustos" class="auth-mascot-img">
        </div>
        <p class="auth-brand-tagline">${this.t('appSubtitle')}</p>
      </div>
      <div class="auth-panel">
        <div class="lang-switcher-auth">${langBar}</div>
        <div class="auth-form-wrap">
          <div class="auth-tabs">
            <button class="auth-tab${isLogin?' active':''}" data-auth-mode="login">${this.t('login')}</button>
            <button class="auth-tab${!isLogin?' active':''}" data-auth-mode="register">${this.t('register')}</button>
          </div>
          <form id="auth-form" autocomplete="on">
            ${!isLogin?`<div class="form-group"><label for="auth-name">${this.t('firstName')}</label><input type="text" id="auth-name" placeholder="${this.t('firstNamePh')}" autocomplete="given-name"></div>`:''}
            <div class="form-group"><label for="auth-email">${this.t('email')}</label><input type="email" id="auth-email" placeholder="${this.t('emailPh')}" autocomplete="email" required></div>
            <div class="form-group"><label for="auth-pass">${this.t('password')}</label>
              <div class="password-input-wrap">
                <input type="password" id="auth-pass" placeholder="${this.t('passPh')}" autocomplete="${isLogin?'current-password':'new-password'}" required>
                <button type="button" class="btn-toggle-pw" data-target="auth-pass" title="Voir/masquer">
                  <svg class="eye-icon eye-closed" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg>
                  <svg class="eye-icon eye-open" width="18" height="18" viewBox="0 0 18 18" fill="none" style="display:none"><path d="M2 2l14 14M7.4 7.6A2.5 2.5 0 0011.4 11.6M4.2 4.4C2.5 5.7 1 9 1 9s3 6 8 6c1.8 0 3.4-.6 4.7-1.6M7 3.3C7.6 3.1 8.3 3 9 3c5 0 8 6 8 6s-.9 1.8-2.5 3.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            ${!isLogin?`
            <div class="pw-strength-wrap" id="pw-strength-wrap">
              <div class="pw-strength-bar"><div class="pw-strength-fill" id="pw-strength-fill"></div></div>
              <div class="pw-reqs">
                <span class="pw-req" id="pw-req-len">8 caractères min.</span>
                <span class="pw-req" id="pw-req-upper">1 majuscule</span>
                <span class="pw-req" id="pw-req-num">1 chiffre ou symbole</span>
              </div>
            </div>
            <div class="form-group"><label for="auth-pass2">${this.t('passwordConfirm')}</label>
              <div class="password-input-wrap">
                <input type="password" id="auth-pass2" placeholder="${this.t('passPh')}" autocomplete="new-password" required>
                <button type="button" class="btn-toggle-pw" data-target="auth-pass2" title="Voir/masquer">
                  <svg class="eye-icon eye-closed" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg>
                  <svg class="eye-icon eye-open" width="18" height="18" viewBox="0 0 18 18" fill="none" style="display:none"><path d="M2 2l14 14M7.4 7.6A2.5 2.5 0 0011.4 11.6M4.2 4.4C2.5 5.7 1 9 1 9s3 6 8 6c1.8 0 3.4-.6 4.7-1.6M7 3.3C7.6 3.1 8.3 3 9 3c5 0 8 6 8 6s-.9 1.8-2.5 3.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>`:''}
            ${this.authError?`<div class="auth-error">${this.escHtml(this.authError)}</div>`:''}
            <button type="submit" class="btn-primary btn-full" id="btn-auth-submit">${isLogin?this.t('signIn'):this.t('createAccount')}</button>
          </form>
          ${isLogin?`<p class="auth-reset"><a href="#" id="btn-reset-pw">${this.t('forgotPw')}</a></p>`:''}
          ${!isLogin?`<p class="auth-trial-note">${this.t('trialNote')}</p>`:''}
        </div>
      </div>
    </div>`;
  },

  bindAuthEvents() {
    document.querySelectorAll('[data-lang-auth]').forEach(btn => btn.addEventListener('click', () => {
      this.lang = btn.dataset.langAuth; localStorage.setItem('recettes_lang', this.lang); this.render();
    }));
    document.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => {
      this.authMode = tab.dataset.authMode; this.authError = ''; this.render();
      document.getElementById('auth-email')?.focus();
    }));
    document.querySelectorAll('.btn-toggle-pw').forEach(btn => btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.querySelector('.eye-closed').style.display = show ? 'none' : '';
      btn.querySelector('.eye-open').style.display = show ? '' : 'none';
    }));
    document.getElementById('auth-pass')?.addEventListener('input', e => {
      if (this.authMode !== 'register') return;
      const { len, upper, numSym, score } = this._pwStrength(e.target.value);
      const fill = document.getElementById('pw-strength-fill');
      if (fill) {
        const colors = ['#e8e0d8', '#e74c3c', '#f39c12', '#27ae60'];
        fill.style.width = ['0%','33%','66%','100%'][score];
        fill.style.background = colors[score];
      }
      document.getElementById('pw-req-len')?.classList.toggle('met', len);
      document.getElementById('pw-req-upper')?.classList.toggle('met', upper);
      document.getElementById('pw-req-num')?.classList.toggle('met', numSym);
    });
    document.getElementById('auth-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('auth-email')?.value?.trim();
      const pass  = document.getElementById('auth-pass')?.value;
      const pass2 = document.getElementById('auth-pass2')?.value;
      const btn   = document.getElementById('btn-auth-submit');
      if (!email || !pass) return;
      if (this.authMode === 'register') {
        const { score } = this._pwStrength(pass);
        if (score < 3) { this._setAuthError('Mot de passe trop faible — remplis les 3 critères.'); return; }
        if (pass !== pass2) { this._setAuthError('Les mots de passe ne correspondent pas.'); return; }
      }
      if (btn) { btn.disabled = true; btn.textContent = this.t('loading'); }
      let error;
      if (this.authMode === 'login') {
        const r = await db.auth.signInWithPassword({ email, password: pass });
        error = r.error;
        if (error && btn) { btn.disabled = false; btn.textContent = this.t('signIn'); }
      } else {
        const name = document.getElementById('auth-name')?.value?.trim() || '';
        const r = await db.auth.signUp({ email, password: pass, options: { data: { full_name: name } } });
        error = r.error;
        if (!error) {
          if (r.data?.user?.id && name) await db.from('profiles').upsert({ id: r.data.user.id, email, name }).catch(() => {});
          this.toast(this.t('accountCreated')); if (btn) { btn.disabled = false; btn.textContent = this.t('createAccount'); } return;
        }
        if (btn) { btn.disabled = false; btn.textContent = this.t('createAccount'); }
      }
      if (error) { this.authError = this.translateAuthError(error.message); this.render(); }
    });
    document.getElementById('btn-reset-pw')?.addEventListener('click', async e => {
      e.preventDefault();
      const email = document.getElementById('auth-email')?.value?.trim();
      if (!email) { this.toast(this.t('enterEmail')); return; }
      await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
      this.toast(this.t('emailSent'));
    });
  },

  translateAuthError(msg) {
    if (msg.includes('Invalid login credentials')) return this.t('authErrCredentials');
    if (msg.includes('Email not confirmed'))       return this.t('authErrConfirm');
    if (msg.includes('User already registered'))   return this.t('authErrExists');
    if (msg.includes('Password should be'))        return this.t('authErrPassword');
    if (msg.includes('rate limit'))                return this.t('authErrRateLimit');
    return msg;
  },

  renderHeader() {
    const isAdmin = this.user?.role === 'admin';
    const initial = (this.user?.name?.[0] || this.user?.email?.[0] || '?').toUpperCase();
    const displayName = this.user?.name || this.user?.email?.split('@')[0] || '';
    const days = this.trialDaysLeft();
    const planClass = this.user?.plan === 'pro' ? 'pro' : (days > 0 ? 'trial' : 'free');
    const planLabel = this.user?.plan === 'pro' ? 'Pro' : (days > 0 ? `J-${days}` : 'Free');
    const cm = LANG_META[this.lang];
    return `<header>
      <div class="header-left">
        <div class="logo" id="nav-home">
          <img class="logo-mark-img" src="Images/gustos-logo-transparent-background.png" alt="Gustos">
          <span>Gustos</span>
        </div>
        <button class="btn-plan-nav" id="btn-plan">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <line x1="1" y1="6" x2="13" y2="6" stroke="currentColor" stroke-width="1.3"/>
            <line x1="4.5" y1="1" x2="4.5" y2="4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="9.5" y1="1" x2="9.5" y2="4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          ${this.t('planningBtn')}
        </button>
      </div>
      <div class="header-center">
        <div class="search-bar">
          <svg class="search-svg-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 10 L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input type="text" id="search-input" placeholder="${this.t('search')}" value="${this.escHtml(this.searchQuery)}">
          <kbd class="search-shortcut">⌘K</kbd>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-primary btn-new" id="btn-new">${this.t('newRecipe')}</button>
        <div class="header-sep"></div>
        <div class="lang-switcher" id="lang-switcher">
          <button class="lang-current" id="btn-lang" title="${cm.name}">
            <span class="lang-flag">${cm.flag}</span>
            <span class="lang-chevron">▾</span>
          </button>
          <div class="lang-dropdown" id="lang-dropdown" hidden>
            ${Object.entries(LANG_META).map(([code, m]) =>
              `<button class="lang-option${this.lang===code?' active':''}" data-lang="${code}">
                <span class="lang-flag">${m.flag}</span>
                <span class="lang-name">${m.name}</span>
              </button>`).join('')}
          </div>
        </div>
        <div class="user-menu" id="user-menu">
          <button class="user-avatar" id="btn-go-account" title="Mon profil">
            ${this.avatarImg ? `<img src="${this.escHtml(this.avatarImg)}" class="avatar-photo" alt="">` : initial}
          </button>
        </div>
      </div>
    </header>`;
  },

  renderAccount() {
    const all = Store.get();
    const mine = all.filter(r => r.authorId === this.user?.id);
    const liked = all.filter(r => this.likedIds.has(r.id));
    const saved = all.filter(r => this.savedIds.has(r.id));
    const tab = this.accountTab;
    const shown = tab === 'liked' ? liked : tab === 'saved' ? saved : mine;
    const isAdmin = this.user?.role === 'admin';
    const displayName = this.user?.name || this.user?.email?.split('@')[0] || '?';
    const initial = displayName[0].toUpperCase();
    const days = this.trialDaysLeft();
    const planClass = this.user?.plan === 'pro' ? 'pro' : (days > 0 ? 'trial' : 'free');
    const planLabel = this.user?.plan === 'pro' ? 'Pro' : (days > 0 ? this.t('trialDays', days) : this.t('freePlan'));
    const totalLikes = Object.values(this.likeCounts).reduce((a, b) => a + b, 0);
    const emptyIcon = tab === 'liked' ? '❤️' : tab === 'saved' ? '🔖' : '🍽️';
    const emptyText = tab === 'liked' ? this.t('noLiked') : tab === 'saved' ? this.t('noSaved') : this.t('noRecipesAcc');
    const emptySub  = tab === 'mine' ? this.t('createFirst') : this.t('exploreHint');
    const avatarLarge = this.avatarImg
      ? `<img src="${this.escHtml(this.avatarImg)}" class="account-avatar-large avatar-photo-large" alt="">`
      : `<div class="account-avatar-large">${initial}</div>`;
    return `<div class="view-account">
      <div class="account-hero">
        <div class="account-avatar-wrap">
          ${avatarLarge}
          <button class="btn-edit-avatar" id="btn-edit-profile" title="${this.t('editProfileTitle')}">✏️</button>
        </div>
        <div class="account-info">
          <h2 class="account-display-name">${this.escHtml(displayName)}</h2>
          <p class="account-email-sub">${this.escHtml(this.user?.email||'')}</p>
          <div class="account-meta">
            <span class="plan-badge plan-${planClass}">${planLabel}</span>
            ${this.user?.plan !== 'pro' && days === 0 ? `<button class="btn-upgrade-sm" id="btn-upgrade-account">${this.t('upgradeBtn')}</button>` : ''}
          </div>
        </div>
        <div class="account-actions-col">
          ${isAdmin ? `<button type="button" class="btn-secondary btn-sm btn-admin-panel" id="btn-go-admin-account">⚙ Admin</button>` : ''}
          <button class="btn-ghost btn-logout-header" id="btn-logout-account">${this.t('disconnectBtn')}</button>
          <button type="button" class="btn-delete-account" id="btn-delete-account">${this.t('deleteAccount')}</button>
        </div>
      </div>
      <div class="profile-edit-card" id="profile-edit-card" hidden>
        <h3>${this.t('editProfileTitle')}</h3>
        <div class="profile-edit-avatar-row">
          <div class="profile-avatar-preview" id="profile-avatar-preview">
            ${this.avatarImg ? `<img src="${this.escHtml(this.avatarImg)}" class="avatar-photo-large" alt="">` : `<div class="account-avatar-large" style="width:72px;height:72px;font-size:1.5rem">${initial}</div>`}
          </div>
          <label class="btn-secondary btn-sm" for="profile-avatar-input" style="cursor:pointer">${this.t('changePhoto')}</label>
          <input type="file" id="profile-avatar-input" accept="image/*" style="display:none">
        </div>
        <div class="form-group" style="margin-top:16px">
          <label for="profile-name-input">${this.t('displayNameLbl')}</label>
          <input type="text" id="profile-name-input" value="${this.escHtml(this.user?.name||'')}">
        </div>
        <div class="form-group" style="margin-top:12px">
          <label for="profile-email-input">${this.t('email')}</label>
          <input type="email" id="profile-email-input" value="${this.escHtml(this.user?.email||'')}">
        </div>
        <div class="profile-edit-actions">
          <button type="button" class="btn-ghost" id="btn-cancel-profile">${this.t('cancelBtn')}</button>
          <button type="button" class="btn-primary" id="btn-save-profile">${this.t('saveBtn')}</button>
        </div>
      </div>
      <div class="account-stats">
        <div class="astat"><span class="astat-val">${all.length}</span><span class="astat-lbl">${this.t('statCreated')}</span></div>
        <div class="astat"><span class="astat-val">${liked.length}</span><span class="astat-lbl">${this.t('statLiked')}</span></div>
        <div class="astat"><span class="astat-val">${saved.length}</span><span class="astat-lbl">${this.t('statSaved')}</span></div>
        <div class="astat"><span class="astat-val">${totalLikes}</span><span class="astat-lbl">${this.t('statLikesRx')}</span></div>
      </div>
      <div class="planning-cta-banner" id="planning-cta">
        <div class="planning-cta-left">
          <span class="planning-cta-icon">📅</span>
          <div>
            <strong>${this.t('planningCtaTitle')}</strong>
            <span>${this.t('planningCtaSub')}</span>
          </div>
        </div>
        <button class="btn-planning-enter" id="btn-go-planning">${this.t('openPlanner')}</button>
      </div>
      <div class="account-tabs-row">
        <button class="account-tab-btn${tab==='mine'?' active':''}" data-tab="mine">${this.t('myRecipes')} <span class="tab-count">${mine.length}</span></button>
        <button class="account-tab-btn${tab==='liked'?' active':''}" data-tab="liked">${this.t('liked')} <span class="tab-count">${liked.length}</span></button>
        <button class="account-tab-btn${tab==='saved'?' active':''}" data-tab="saved">${this.t('bookmarked')} <span class="tab-count">${saved.length}</span></button>
      </div>
      ${shown.length === 0
        ? `<div class="empty-state"><div class="empty-icon">${emptyIcon}</div><h3>${emptyText}</h3><p>${emptySub}</p></div>`
        : `<div class="recipe-grid">${shown.map(r => this.renderCard(r)).join('')}</div>`}
    </div>`;
  },

  renderAdminPanel() {
    if (!this.adminStats) return `<div class="view-admin"><div class="admin-header"><button class="btn-ghost" id="btn-back">← Retour</button><h2>Admin</h2></div><div class="admin-loading"><div class="loading-spinner"></div> ${this.t('loading')}</div></div>`;
    const stats = this.adminStats;
    const ta = u => u.trial_ends_at && new Date(u.trial_ends_at) > new Date();
    const fmt = d => new Date(d).toLocaleDateString('fr-FR');
    return `<div class="view-admin">
      <div class="admin-header"><button class="btn-ghost" id="btn-back">${this.t('back')}</button><h2>${this.t('adminUsers', stats.length)}</h2></div>
      <div class="admin-kpis">
        <div class="admin-kpi"><div class="kpi-val">${stats.length}</div><div class="kpi-lbl">${this.t('adminAccounts')}</div></div>
        <div class="admin-kpi"><div class="kpi-val">${stats.filter(u=>u.plan==='pro').length}</div><div class="kpi-lbl">Pro</div></div>
        <div class="admin-kpi"><div class="kpi-val">${stats.filter(u=>ta(u)&&u.plan==='free').length}</div><div class="kpi-lbl">${this.t('adminTrial')}</div></div>
        <div class="admin-kpi"><div class="kpi-val">${stats.reduce((s,u)=>s+(u.recipe_count||0),0)}</div><div class="kpi-lbl">${this.t('statRecipes')}</div></div>
      </div>
      <div class="admin-table-wrap"><table class="admin-table">
        <thead><tr><th>${this.t('adminColEmail')}</th><th>${this.t('adminColPlan')}</th><th>${this.t('adminColTrialCol')}</th><th>${this.t('adminColRecipes')}</th><th>${this.t('adminColJoined')}</th><th>${this.t('adminColAction')}</th></tr></thead>
        <tbody>${stats.map(u=>`<tr>
          <td class="td-email">${this.escHtml(u.email)}${u.role==='admin'?' <span class="plan-badge plan-admin">admin</span>':''}</td>
          <td><span class="plan-badge plan-${u.plan}">${u.plan}</span></td>
          <td>${u.trial_ends_at?(ta(u)?`<span class="trial-active">→ ${fmt(u.trial_ends_at)}</span>`:`<span class="trial-expired">Expiré</span>`):'—'}</td>
          <td>${u.recipe_count??0}</td><td>${fmt(u.created_at)}</td>
          <td>${u.role!=='admin'?(u.plan==='pro'?`<button class="btn-small btn-ghost" data-set-plan="${u.id}" data-plan="free">→ Free</button>`:`<button class="btn-small btn-primary" data-set-plan="${u.id}" data-plan="pro">→ Pro</button>`):'—'}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
  },

  async adminSetPlan(userId, plan) {
    const { error } = await db.rpc('admin_set_plan', { target_user_id: userId, new_plan: plan });
    if (error) { this.toast('Erreur : ' + error.message); return; }
    const { data } = await db.rpc('get_admin_stats');
    this.adminStats = data || []; this.render(); this.toast('Plan mis à jour.');
  },

  renderList() {
    const all = Store.get();
    const rawCats = [...new Set(all.map(r => r.category).filter(Boolean).sort())];
    let shown = all;
    if (this.activeCategory !== ALL_CAT) shown = shown.filter(r => r.category === this.activeCategory);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      shown = shown.filter(r => r.name.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q) || r.ingredients.some(i=>i.name.toLowerCase().includes(q)) || (r.tags||[]).some(t=>t.toLowerCase().includes(q)));
    }
    const times = all.filter(r=>r.prepTime||r.cookTime).map(r=>(r.prepTime||0)+(r.cookTime||0));
    const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;
    const sectionLabel = this.searchQuery
      ? this.t('searchResults', shown.length, this.escHtml(this.searchQuery))
      : (this.activeCategory === ALL_CAT ? this.t('allRecipesLabel') : this.activeCategory);
    const firstName = this.user?.name || '';
    return `<div class="view-list">
      <div class="hero">
        <p class="hero-greeting">${this.t('heroGreeting')}${firstName ? `, <strong>${this.escHtml(firstName)}</strong>` : ''} 👋</p>
        <h1 class="hero-title">${this.t('heroTitle')}</h1>
        <div class="hero-search-wrap">
          <div class="hero-search-bar">
            <svg class="hero-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M13 13 L18.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <input type="text" id="hero-search-input" placeholder="${this.t('heroSearchPh')}" value="${this.escHtml(this.searchQuery)}" autocomplete="off">
            ${this.searchQuery?`<button class="hero-search-clear" id="hero-search-clear">✕</button>`:''}
          </div>
        </div>
        <div class="stats-bar">
          <div class="stat"><span class="stat-value">${all.length}</span><span class="stat-label">${this.t('statRecipes')}</span></div>
          <div class="stat"><span class="stat-value">${rawCats.length}</span><span class="stat-label">${this.t('statCats')}</span></div>
          <div class="stat"><span class="stat-value">${avg||'—'}</span><span class="stat-label">${this.t('statAvg')}</span></div>
        </div>
      </div>
      <div class="categories">
        <button class="category-pill${this.activeCategory===ALL_CAT?' active':''}" data-cat="${ALL_CAT}">${this.t('allCat')}</button>
        ${rawCats.map(c=>`<button class="category-pill${this.activeCategory===c?' active':''}" data-cat="${this.escHtml(c)}">${c}</button>`).join('')}
      </div>
      <p class="section-title" id="section-title">${sectionLabel}</p>
      <div id="results-area">
        ${shown.length===0
          ?`<div class="empty-state"><div class="empty-icon">${this.searchQuery?'🔍':'🍽️'}</div><h3>${this.searchQuery?this.t('noResults'):this.t('noRecipes')}</h3><p>${this.searchQuery?this.t('noResultsSub'):this.t('noRecipesSub')}</p></div>`
          :`<div class="recipe-grid">${shown.map(r=>this.renderCard(r)).join('')}</div>`}
      </div>
    </div>`;
  },

  updateHeroResults() {
    const all = Store.get();
    let shown = all;
    if (this.activeCategory !== ALL_CAT) shown = shown.filter(r => r.category === this.activeCategory);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      shown = shown.filter(r => r.name.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q) || r.ingredients.some(i=>i.name.toLowerCase().includes(q)) || (r.tags||[]).some(t=>t.toLowerCase().includes(q)));
    }
    const sectionLabel = this.searchQuery
      ? this.t('searchResults', shown.length, this.escHtml(this.searchQuery))
      : (this.activeCategory === ALL_CAT ? this.t('allRecipesLabel') : this.activeCategory);
    const titleEl = document.getElementById('section-title');
    if (titleEl) titleEl.textContent = sectionLabel;
    const area = document.getElementById('results-area');
    if (!area) return;
    area.innerHTML = shown.length === 0
      ? `<div class="empty-state"><div class="empty-icon">${this.searchQuery?'🔍':'🍽️'}</div><h3>${this.searchQuery?this.t('noResults'):this.t('noRecipes')}</h3><p>${this.searchQuery?this.t('noResultsSub'):this.t('noRecipesSub')}</p></div>`
      : `<div class="recipe-grid">${shown.map(r=>this.renderCard(r)).join('')}</div>`;
    document.querySelectorAll('#results-area .recipe-card').forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-save-card]')) return;
      this.nav('recipe', el.dataset.id);
    }));
    document.querySelectorAll('#results-area [data-save-card]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleSave(btn.dataset.saveCard).catch(err => this.toast('Erreur : '+err.message));
    }));
  },

  renderCard(r) {
    const total = (r.prepTime||0)+(r.cookTime||0);
    const emoji = CAT_EMOJI[r.category]||'🍴';
    const cover = this.getCover(r);
    const img = cover?`<img src="${cover}" alt="${this.escHtml(r.name)}" loading="lazy">`:`<span style="font-size:3.5rem">${emoji}</span>`;
    const lc = this.likeCounts[r.id]||0;
    const isSaved = this.savedIds.has(r.id);
    return `<div class="recipe-card" data-id="${r.id}">
      <div class="card-image">
        ${img}
        <button class="card-save-btn${isSaved?' saved':''}" data-save-card="${r.id}">${isSaved?'🔖':'📌'}</button>
      </div>
      <div class="card-body">
        <div class="card-category-row">
          <span class="card-category">${r.category||this.t('noCat')}</span>
          ${r.authorName?`<span class="card-author">par ${this.escHtml(r.authorName)}</span>`:''}
        </div>
        <div class="card-title">${this.escHtml(r.name)}</div>
        <div class="card-desc">${this.escHtml(r.description||'')}</div>
        <div class="card-meta">
          ${total?`<span class="meta-item">⏱ ${total} min</span>`:''}
          <span class="meta-item">👥 ${this.t('persons', r.basePeople)}</span>
          <span class="meta-item">🥬 ${this.t('ingrs', r.ingredients.length)}</span>
          <span class="meta-item card-likes" style="${lc?'':'display:none'}">${lc?`❤️ ${lc}`:''}</span>
        </div>
      </div>
    </div>`;
  },

  renderRecipe() {
    const r = Store.byId(this.currentId);
    if (!r) return '<p style="padding:40px">Recette introuvable.</p>';
    const ratio = this.portionCount/r.basePeople;
    const total = (r.prepTime||0)+(r.cookTime||0);
    const cover = this.getCover(r);
    const emoji = CAT_EMOJI[r.category]||'🍴';
    const liked = this.likedIds.has(r.id);
    const saved = this.savedIds.has(r.id);
    const lc = this.likeCounts[r.id]||0;
    const metaBoxes = [
      r.prepTime?`<div class="meta-box"><div class="meta-box-value">${r.prepTime} min</div><div class="meta-box-label">${this.t('prep')}</div></div>`:'',
      r.cookTime?`<div class="meta-box"><div class="meta-box-value">${r.cookTime} min</div><div class="meta-box-label">${this.t('cook')}</div></div>`:'',
      total?`<div class="meta-box"><div class="meta-box-value">${total} min</div><div class="meta-box-label">${this.t('total')}</div></div>`:''
    ].filter(Boolean).join('');
    const canEdit = this.user?.role === 'admin' || (r.authorId === this.user?.id) || (!r.authorId && !r.authorName);
    return `<div class="view-recipe">
      <div class="recipe-header">
        <button class="btn-ghost" id="btn-back">${this.t('back')}</button>
        <div class="recipe-header-actions">
          ${canEdit ? `<button class="btn-secondary" id="btn-edit">${this.t('edit')}</button>
          <button class="btn-danger" id="btn-delete">${this.t('delete')}</button>` : ''}
        </div>
      </div>
      <div class="recipe-hero">
        <div class="recipe-main-image">${cover?`<img src="${cover}" alt="${this.escHtml(r.name)}">`:`<span style="font-size:7rem">${emoji}</span>`}</div>
        <div class="recipe-info">
          <span class="recipe-category-badge">${r.category||this.t('noCat')}</span>
          <h1 class="recipe-title">${this.escHtml(r.name)}</h1>
          ${r.authorName?`<p class="recipe-author">Par ${this.escHtml(r.authorName)}</p>`:''}
          ${r.description?`<p class="recipe-description">${this.escHtml(r.description)}</p>`:''}
          ${metaBoxes?`<div class="recipe-meta-grid">${metaBoxes}</div>`:''}
          <div class="social-actions">
            <button class="social-btn${liked?' active liked':''}" data-like="${r.id}">
              <span class="si">${liked?'❤️':'🤍'}</span><span class="sc">${lc}</span>
            </button>
            <button class="social-btn${saved?' active saved':''}" data-save="${r.id}">
              <span class="si">${saved?'🔖':'📌'}</span><span class="sl">${saved?this.t('saved'):this.t('save')}</span>
            </button>
          </div>
          <div class="portion-calc">
            <h3>${this.t('adjustPortions')}</h3>
            <div class="portion-controls">
              <button class="portion-btn" id="p-dec">−</button>
              <input type="range" class="portion-slider" id="p-slider" min="1" max="30" value="${this.portionCount}">
              <button class="portion-btn" id="p-inc">+</button>
              <span class="portion-display" id="p-num">${this.portionCount}</span>
              <span class="portion-label">${this.t('person', this.portionCount)}</span>
            </div>
            <div class="portion-base">${this.t('base', r.basePeople)}</div>
          </div>
          ${r.tags&&r.tags.length?`<div class="recipe-tags">${r.tags.map(t=>`<span class="tag">${this.escHtml(t)}</span>`).join('')}</div>`:''}
        </div>
      </div>
      <div class="recipe-sections">
        <div>
          <h2 class="section-heading">${this.t('ingsTitle')}</h2>
          <ul class="ingredient-list" id="ing-list">
            ${r.ingredients.map((ing,i)=>`<li class="ingredient-item" data-idx="${i}"><div class="ingredient-check"></div><span class="ingredient-qty" id="qty-${i}">${this.fmtQty(ing.qty*ratio)} ${ing.unit}</span><span class="ingredient-name">${this.escHtml(ing.name)}</span></li>`).join('')}
          </ul>
        </div>
        <div>
          <h2 class="section-heading">${this.t('stepsTitle')}</h2>
          <div class="steps-list" id="steps-list">
            ${r.steps.map((s,i)=>{const step=this.normalizeStep(s);return`<div class="step-item"><div class="step-number">${i+1}</div><div class="step-body"><div class="step-content">${this.parseStepText(step.text,r.ingredients,ratio)}</div>${step.image?`<img src="${step.image}" class="step-photo" data-lightbox loading="lazy">`:''}</div></div>`;}).join('')}
          </div>
        </div>
      </div>
    </div>`;
  },

  parseStepText(text, ingredients, ratio) {
    if (!text) return '';
    const normalized = text.replace(/[｛❴{]/g,'{').replace(/[｝❵}]/g,'}');
    return this.escHtml(normalized).replace(/\{([^}]+)\}/g, (_, raw) => {
      const name = raw.trim();
      const ing = ingredients.find(i => i.name.trim().toLowerCase() === name.toLowerCase());
      if (!ing) return `<span class="ing-ref-miss">{${this.escHtml(name)}}</span>`;
      return `<span class="ing-ref">${this.fmtQty(ing.qty*ratio)} ${this.escHtml(ing.unit)} de <strong>${this.escHtml(ing.name)}</strong></span>`;
    });
  },

  fmtQty(n) {
    if (!n&&n!==0) return '—';
    const r=Math.round(n*8)/8;
    if(r===Math.floor(r))return r;
    const d=r-Math.floor(r);
    const fracs={0.125:'⅛',0.25:'¼',0.375:'⅜',0.5:'½',0.625:'⅝',0.75:'¾',0.875:'⅞'};
    const frac=fracs[Math.round(d*8)/8];
    if(frac)return Math.floor(r)>0?`${Math.floor(r)} ${frac}`:frac;
    return parseFloat(r.toFixed(2));
  },

  updatePortions(val) {
    const r=Store.byId(this.currentId); if(!r)return;
    this.portionCount=Math.max(1,Math.min(50,val));
    const ratio=this.portionCount/r.basePeople;
    const slider=document.getElementById('p-slider'),num=document.getElementById('p-num');
    if(slider)slider.value=this.portionCount;
    if(num){num.textContent=this.portionCount;const lbl=num.nextElementSibling;if(lbl)lbl.textContent=this.t('person',this.portionCount);}
    r.ingredients.forEach((ing,i)=>{const el=document.getElementById(`qty-${i}`);if(el)el.textContent=`${this.fmtQty(ing.qty*ratio)} ${ing.unit}`;});
    document.querySelectorAll('#steps-list .step-content').forEach((el,i)=>{const s=r.steps[i];if(s!==undefined)el.innerHTML=this.parseStepText(this.normalizeStep(s).text,r.ingredients,ratio);});
  },

  renderForm() {
    const isEdit=this.view==='edit';
    const r=isEdit?Store.byId(this.editingId):null;
    const fd=this.formData;
    const ingNames=fd.ingredients.filter(i=>i.name.trim()).map(i=>i.name.trim());
    const allIngNames=[...new Set(Store.get().flatMap(rec=>rec.ingredients?.map(i=>i.name).filter(Boolean)||[]))].sort();
    return `<div class="view-create">
      <div class="create-header"><button class="btn-ghost" id="btn-back">${this.t('back')}</button><h2>${isEdit?this.t('editRecipeTitle'):this.t('newRecipeTitle')}</h2></div>
      <div class="form-section"><h3>${this.t('generalInfo')}</h3>
        <div class="form-grid">
          <div class="form-group full"><label for="f-name">${this.t('nameLbl')}</label><input type="text" id="f-name" placeholder="${this.t('namePh')}" value="${this.escHtml(r?r.name:'')}"></div>
          <div class="form-group"><label for="f-cat">${this.t('catLbl')}</label><select id="f-cat"><option value="">${this.t('chooseCat')}</option>${CATEGORIES.map(c=>`<option${r&&r.category===c?' selected':''}>${c}</option>`).join('')}</select></div>
          <div class="form-group"><label for="f-people">${this.t('portionsLbl')}</label><input type="number" id="f-people" min="1" max="100" value="${r?r.basePeople:4}"></div>
          <div class="form-group"><label for="f-prep">${this.t('prepLbl')}</label><input type="number" id="f-prep" min="0" value="${r&&r.prepTime?r.prepTime:''}"></div>
          <div class="form-group"><label for="f-cook">${this.t('cookLbl')}</label><input type="number" id="f-cook" min="0" value="${r&&r.cookTime?r.cookTime:''}"></div>
          <div class="form-group full"><label for="f-desc">${this.t('descLbl')}</label><textarea id="f-desc">${this.escHtml(r?r.description||'':'')}</textarea></div>
        </div>
      </div>
      <div class="form-section"><h3>${this.t('coverTitle')}</h3><p class="form-hint">${this.t('coverHint')}</p>
        <div id="cover-area">${this.renderCoverArea(fd.coverImage)}</div>
        <input type="file" id="cover-file" accept="image/*" style="display:none">
      </div>
      <div class="form-section"><h3>${this.t('ingsLbl')}</h3>
        <datalist id="ing-names-list">${allIngNames.map(n=>`<option value="${this.escHtml(n)}">`).join('')}</datalist>
        <div class="ing-header${fd.ingredients.length===0?' ing-header-hidden':''}"><span></span><span>${this.t('ingsLbl')}</span><span>Qté</span><span>Unité</span><span></span></div>
        <div class="ingredients-builder" id="ing-builder">${fd.ingredients.map((ing,i)=>this.renderIngRow(ing,i)).join('')}</div>
        <div class="ing-quick-add">
          <div class="ing-qa-field">
            <label class="ing-qa-label">Nom</label>
            <input type="text" id="ing-add-input" placeholder="${this.t('ingNamePh')}" list="ing-names-list" autocomplete="off">
          </div>
          <div class="ing-qa-field ing-qa-field-qty">
            <label class="ing-qa-label">Qté</label>
            <input type="number" id="ing-add-qty" placeholder="100" min="0" step="any">
          </div>
          <div class="ing-qa-field ing-qa-field-unit">
            <label class="ing-qa-label">Unité</label>
            <select id="ing-add-unit">${UNITS.map(u=>`<option>${u}</option>`).join('')}</select>
          </div>
          <button type="button" class="btn-add-ing-quick" id="btn-add-ing">+ Ajouter</button>
        </div>
      </div>
      <div class="form-section"><h3>${this.t('stepsLbl')}</h3>
        <div id="ing-ref-helper" class="ing-ref-helper" ${ingNames.length?'':'style="display:none"'}>${this.t('dynHelper')}<br><span class="ing-ref-names">${ingNames.map(n=>`<code>{${this.escHtml(n)}}</code>`).join(' ')}</span></div>
        <div class="steps-builder" id="steps-builder">${fd.steps.map((s,i)=>this.renderStepRow(s,i)).join('')}</div>
        <button class="btn-add" id="btn-add-step">${this.t('addStep')}</button>
      </div>
      <div class="form-section"><h3>${this.t('tagsLbl')}</h3>
        <div class="form-group"><label>${this.t('tagsInputLbl')}</label>
          <div class="tags-input" id="tags-box">
            ${fd.tags.map((t,i)=>`<span class="tag">${this.escHtml(t)}<button class="tag-remove" data-tag="${i}">✕</button></span>`).join('')}
            <input type="text" class="tags-text-input" id="tag-input" placeholder="${fd.tags.length?'':this.t('tagsPh')}">
          </div>
        </div>
      </div>
      <div class="form-actions">
        ${isEdit?`<button class="btn-danger" id="btn-del-form">${this.t('deleteBtn')}</button>`:''}
        <button class="btn-ghost" id="btn-cancel">${this.t('cancelBtn')}</button>
        <button class="btn-primary" id="btn-save">${isEdit?this.t('saveBtn'):this.t('createBtn')}</button>
      </div>
    </div>`;
  },

  renderCoverArea(src) {
    if(src)return`<div class="cover-preview-wrap"><img src="${src}" class="cover-preview-img"><div class="cover-preview-actions"><button class="btn-cover-action" id="btn-change-cover">${this.t('coverChange')}</button><button class="btn-cover-action btn-cover-remove" id="btn-rm-cover">${this.t('coverRm')}</button></div></div>`;
    return`<div class="cover-upload-empty" id="cover-upload-empty"><div class="upload-icon">🖼️</div><div class="upload-text"><strong>${this.t('coverAdd')}</strong></div><div class="upload-hint">${this.t('coverOne')}</div></div>`;
  },

  renderIngRow(ing,i){return`<div class="ingredient-row" data-ing="${i}" draggable="true"><div class="drag-handle">⠿</div><input type="text" placeholder="${this.t('ingNamePh')}" value="${this.escHtml(ing.name)}" data-f="name" data-i="${i}" list="ing-names-list"><input type="number" placeholder="${this.t('ingQtyPh')}" value="${ing.qty}" data-f="qty" data-i="${i}" min="0" step="any"><select data-f="unit" data-i="${i}">${UNITS.map(u=>`<option${ing.unit===u?' selected':''}>${u}</option>`).join('')}</select><button class="btn-icon btn-remove" data-del-ing="${i}">✕</button></div>`;},

  renderStepRow(s,i){const step=this.normalizeStep(s);return`<div class="step-row" data-step="${i}"><div class="step-num-badge">${i+1}</div><div class="step-field"><textarea placeholder="${this.t('stepPh')}" data-si="${i}">${this.escHtml(step.text)}</textarea><div class="step-img-zone" id="step-img-zone-${i}">${this.renderStepImgZone(step,i)}</div></div><button class="btn-icon btn-remove" data-del-step="${i}">✕</button></div>`;},

  renderStepImgZone(step,i){if(step.image)return`<div class="step-img-preview-form"><img src="${step.image}" class="step-img-thumb" alt="Photo étape ${i+1}"><button class="btn-rm-step-img" data-rm-step-img="${i}">✕</button></div>`;return`<label class="step-img-add-btn"><input type="file" accept="image/*" style="display:none" data-img-input="${i}"><span>${this.t('addStepPhoto')}</span></label>`;},

  bindHeader() {
    document.getElementById('nav-home')?.addEventListener('click', () => { this.view='list'; this.searchQuery=''; this.render(); });
    document.getElementById('btn-new')?.addEventListener('click', () => this.nav('create'));
    document.getElementById('btn-admin')?.addEventListener('click', () => this.nav('admin'));

    const si = document.getElementById('search-input');
    si?.addEventListener('input', e => { this.searchQuery = e.target.value; if (this.view==='list') this.renderContent(); });
    document.addEventListener('keydown', e => { if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); si?.focus(); si?.select(); } });

    // Sélecteur de langue
    const langBtn = document.getElementById('btn-lang');
    const langDrop = document.getElementById('lang-dropdown');
    langBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const open = !langDrop.hidden;
      langDrop.hidden = open;
      if (!open) document.addEventListener('click', () => { langDrop.hidden = true; }, { once: true });
    });
    document.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      this.lang = btn.dataset.lang;
      localStorage.setItem('recettes_lang', this.lang);
      langDrop.hidden = true;
      this.render();
    }));

    document.getElementById('btn-go-account')?.addEventListener('click', () => { this.accountTab='mine'; this.nav('account'); });
    document.getElementById('btn-plan')?.addEventListener('click', () => this.nav('planning'));
  },

  bindContent() {
    // Tooltip mouseenter/mouseleave sur chaque bouton épingle (précis, sans bubbling)
    if (this._saveTip) {
      document.querySelectorAll('.card-save-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          const isSaved = this.savedIds.has(btn.dataset.saveCard);
          this._saveTip.textContent = isSaved ? '✓ Enregistrée — visible dans votre profil' : 'Enregistrer la recette';
          this._saveTip.classList.toggle('tip-saved', isSaved);
          const r = btn.getBoundingClientRect();
          this._saveTip.style.top = (r.top + r.height / 2) + 'px';
          this._saveTip.style.left = (r.left - 8) + 'px';
          this._saveTip.style.opacity = '1';
        });
        btn.addEventListener('mouseleave', () => { this._saveTip.style.opacity = '0'; });
      });
    }
    const heroInput = document.getElementById('hero-search-input');
    if (heroInput) {
      heroInput.addEventListener('input', e => {
        this.searchQuery = e.target.value;
        const hdr = document.getElementById('search-input');
        if (hdr) hdr.value = e.target.value;
        this.updateHeroResults();
      });
    }
    document.getElementById('hero-search-clear')?.addEventListener('click', () => {
      this.searchQuery = '';
      const hdr = document.getElementById('search-input');
      if (hdr) hdr.value = '';
      this.renderContent();
    });
    // Profil edit
    document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
      const card = document.getElementById('profile-edit-card');
      if (card) card.hidden = !card.hidden;
    });
    document.getElementById('btn-cancel-profile')?.addEventListener('click', () => {
      const card = document.getElementById('profile-edit-card');
      if (card) card.hidden = true;
    });
    document.getElementById('btn-go-admin-account')?.addEventListener('click', () => this.nav('admin'));
    document.getElementById('profile-avatar-input')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) this.handleAvatarUpload(file);
    });

    document.querySelectorAll('.recipe-card').forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-save-card]')) return;
      this.nav('recipe', el.dataset.id);
    }));
    document.querySelectorAll('.category-pill').forEach(el => el.addEventListener('click', () => { this.activeCategory=el.dataset.cat; this.renderContent(); }));
    document.querySelectorAll('[data-save-card]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleSave(btn.dataset.saveCard).then(() => {
        if (this._saveTip && this._saveTip.style.opacity === '1') {
          const isSaved = this.savedIds.has(btn.dataset.saveCard);
          this._saveTip.textContent = isSaved ? '✓ Enregistrée — visible dans votre profil' : 'Enregistrer la recette';
          this._saveTip.classList.toggle('tip-saved', isSaved);
        }
      }).catch(err => this.toast('Erreur : '+err.message));
    }));
    document.getElementById('btn-back')?.addEventListener('click', () => this.goBack());
    document.getElementById('btn-edit')?.addEventListener('click', () => this.nav('edit', this.currentId));
    document.getElementById('btn-delete')?.addEventListener('click', () => {
      if(confirm(this.t('deleteConfirm'))) this.deleteRecipeById(this.currentId).catch(e=>this.toast('Erreur : '+e.message));
    });
    document.getElementById('p-slider')?.addEventListener('input', e => this.updatePortions(+e.target.value));
    document.getElementById('p-dec')?.addEventListener('click', () => this.updatePortions(this.portionCount-1));
    document.getElementById('p-inc')?.addEventListener('click', () => this.updatePortions(this.portionCount+1));
    document.querySelectorAll('.ingredient-item').forEach(li => li.addEventListener('click', () => li.classList.toggle('checked')));
    document.querySelectorAll('[data-lightbox]').forEach(img => img.addEventListener('click', () => this.showLightbox(img.src)));
    document.querySelector('[data-like]')?.addEventListener('click', e => {
      this.toggleLike(e.currentTarget.dataset.like).catch(err=>this.toast('Erreur : '+err.message));
    });
    document.querySelector('[data-save]')?.addEventListener('click', e => {
      this.toggleSave(e.currentTarget.dataset.save).catch(err=>this.toast('Erreur : '+err.message));
    });
    document.getElementById('btn-cancel')?.addEventListener('click', () => this.goBack());
    document.getElementById('btn-del-form')?.addEventListener('click', () => {
      if(confirm(this.t('deleteConfirm'))) this.deleteRecipeById(this.editingId).catch(e=>this.toast('Erreur : '+e.message));
    });
    document.getElementById('btn-save')?.addEventListener('click', () => this.saveRecipe().catch(e=>this.toast('Erreur : '+e.message)));
    document.querySelectorAll('[data-set-plan]').forEach(btn => btn.addEventListener('click', () => this.adminSetPlan(btn.dataset.setPlan, btn.dataset.plan)));
    document.querySelectorAll('.account-tab-btn').forEach(btn => btn.addEventListener('click', () => { this.accountTab=btn.dataset.tab; this.renderContent(); }));
    document.getElementById('btn-logout-account')?.addEventListener('click', async () => { await db.auth.signOut(); });
    document.getElementById('btn-delete-account')?.addEventListener('click', () => this.confirmDeleteAccount());
    document.getElementById('btn-upgrade-account')?.addEventListener('click', () => this.showUpgradeModal());
    document.getElementById('btn-go-planning')?.addEventListener('click', () => this.nav('planning'));

    // ===== PLANNING HANDLERS =====
    document.querySelectorAll('[data-goto-week]').forEach(btn => btn.addEventListener('click', () => {
      this.planWeek = btn.dataset.gotoWeek; this.generateShoppingList(); this.renderContent();
    }));
    document.getElementById('btn-back-planner')?.addEventListener('click', () => this.goBack());
    document.querySelectorAll('[data-add-date]').forEach(btn => btn.addEventListener('click', () => {
      this.pickerOpen = { date: btn.dataset.addDate, meal: btn.dataset.addMeal };
      this.pickerQuery = ''; this.pickerTab = 'all'; this.renderContent();
    }));
    document.querySelectorAll('[data-rm-date]').forEach(btn => btn.addEventListener('click', () => {
      this.removeFromPlan(btn.dataset.rmDate, btn.dataset.rmMeal, btn.dataset.rmId); this.renderContent();
    }));
    document.querySelectorAll('[data-port-dir]').forEach(btn => btn.addEventListener('click', () => {
      const { portDir, portDate, portMeal, portId } = btn.dataset;
      const key = `${portDate}|${portMeal}|${portId}`;
      const r = Store.byId(portId);
      const cur = this.planPortions[key] || r?.basePeople || 4;
      this.planPortions[key] = Math.max(1, Math.min(50, cur + parseInt(portDir)));
      this.generateShoppingList(); this.savePlan(); this.renderContent();
    }));
    document.querySelectorAll('[data-open-recipe]').forEach(btn => btn.addEventListener('click', () => {
      this.nav('recipe', btn.dataset.openRecipe, { portions: parseInt(btn.dataset.openPortions) || 4 });
    }));
    // Picker modal
    const closePicker = () => { this.pickerOpen = null; this.pickerQuery = ''; this.pickerTab = 'all'; this.renderContent(); };
    document.getElementById('btn-close-picker')?.addEventListener('click', closePicker);
    document.getElementById('picker-overlay')?.addEventListener('click', e => { if (e.target.id === 'picker-overlay') closePicker(); });
    // Picker tabs
    document.querySelectorAll('[data-picker-tab]').forEach(btn => btn.addEventListener('click', () => {
      this.pickerTab = btn.dataset.pickerTab;
      document.querySelectorAll('[data-picker-tab]').forEach(b => b.classList.toggle('active', b.dataset.pickerTab === this.pickerTab));
      this.updatePickerList();
    }));
    // Picker search
    const pickerSearch = document.getElementById('picker-search');
    if (pickerSearch) {
      pickerSearch.focus();
      pickerSearch.addEventListener('input', e => { this.pickerQuery = e.target.value; this.updatePickerList(); });
    }
    document.getElementById('btn-picker-clear')?.addEventListener('click', () => {
      this.pickerQuery = ''; const s = document.getElementById('picker-search'); if (s) s.value = ''; this.updatePickerList();
    });
    // Picker cards (initial render)
    document.querySelectorAll('[data-pick]').forEach(btn => btn.addEventListener('click', () => {
      if (this.pickerOpen) { this.addToPlan(this.pickerOpen.date, this.pickerOpen.meal, btn.dataset.pick); this.pickerOpen = null; this.pickerQuery = ''; this.renderContent(); }
    }));
    // Shopping list
    document.querySelectorAll('[data-check-item]').forEach(btn => btn.addEventListener('click', () => this.toggleShoppingItem(btn.dataset.checkItem)));
    document.querySelectorAll('[data-del-item]').forEach(btn => btn.addEventListener('click', () => this.removeShoppingItem(btn.dataset.delItem)));
    document.getElementById('btn-clear-checked')?.addEventListener('click', () => this.clearCheckedItems());
    document.getElementById('btn-regen')?.addEventListener('click', () => { this.generateShoppingList(); this.renderContent(); });
    document.getElementById('btn-add-manual')?.addEventListener('click', () => {
      const name = document.getElementById('manual-name')?.value || '';
      const qty  = document.getElementById('manual-qty')?.value || '';
      const unit = document.getElementById('manual-unit')?.value || '';
      if (name.trim()) {
        this.addManualItem(name, qty, unit);
        const ni = document.getElementById('manual-name'); if (ni) { ni.value = ''; ni.focus(); }
        const qi = document.getElementById('manual-qty'); if (qi) qi.value = '';
        const ui = document.getElementById('manual-unit'); if (ui) ui.value = '';
      }
    });
    document.getElementById('manual-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-add-manual')?.click(); });

    this.bindCoverEvents();
    const ingBuilder=document.getElementById('ing-builder');
    if(ingBuilder)this.bindIngEvents(ingBuilder);
    const stepsBuilder=document.getElementById('steps-builder');
    if(stepsBuilder)this.bindStepEvents(stepsBuilder);
    document.getElementById('btn-add-step')?.addEventListener('click',()=>{this.formData.steps.push({text:'',image:null});this.rebuildSteps();});
    this.bindTagEvents();
  },

  bindCoverEvents(){
    const coverFile=document.getElementById('cover-file'),coverArea=document.getElementById('cover-area'),openPicker=()=>coverFile?.click();
    coverArea?.querySelector('#cover-upload-empty')?.addEventListener('click',openPicker);
    coverArea?.querySelector('#btn-change-cover')?.addEventListener('click',openPicker);
    coverArea?.querySelector('#btn-rm-cover')?.addEventListener('click',()=>{this.formData.coverImage=null;this.rebuildCoverImg();});
    coverFile?.addEventListener('change',e=>{const f=e.target.files[0];if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=ev=>{this.formData.coverImage=ev.target.result;this.rebuildCoverImg();};r.readAsDataURL(f);e.target.value='';});
  },

  bindIngEvents(root){
    root.addEventListener('input',e=>{const el=e.target.closest('[data-f]');if(!el)return;const i=+el.dataset.i,f=el.dataset.f;this.formData.ingredients[i][f]=f==='qty'?(parseFloat(el.value)||''):el.value;this.updateIngHelper();});
    root.addEventListener('change',e=>{const el=e.target.closest('[data-f]');if(el&&el.tagName==='SELECT')this.formData.ingredients[+el.dataset.i][el.dataset.f]=el.value;});
    root.addEventListener('click',e=>{const btn=e.target.closest('[data-del-ing]');if(!btn)return;this.formData.ingredients.splice(+btn.dataset.delIng,1);this.rebuildIngs();});
    let dragSrc=null;
    root.addEventListener('dragstart',e=>{const row=e.target.closest('.ingredient-row');if(!row)return;dragSrc=+row.dataset.ing;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(dragSrc));requestAnimationFrame(()=>row.classList.add('dragging'));});
    root.addEventListener('dragend',()=>{root.querySelectorAll('.dragging,.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));dragSrc=null;});
    root.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';const row=e.target.closest('.ingredient-row');root.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));if(row&&dragSrc!==null&&+row.dataset.ing!==dragSrc)row.classList.add('drag-over');});
    root.addEventListener('dragleave',e=>{if(!root.contains(e.relatedTarget))root.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));});
    root.addEventListener('drop',e=>{e.preventDefault();const row=e.target.closest('.ingredient-row');if(!row||dragSrc===null)return;const dropIdx=+row.dataset.ing;if(dropIdx===dragSrc)return;const arr=this.formData.ingredients,[item]=arr.splice(dragSrc,1);arr.splice(dropIdx>dragSrc?dropIdx-1:dropIdx,0,item);this.rebuildIngs();});
  },

  bindStepEvents(root){
    root.addEventListener('input',e=>{const ta=e.target.closest('[data-si]');if(ta)this.formData.steps[+ta.dataset.si].text=ta.value;});
    root.addEventListener('click',e=>{
      const del=e.target.closest('[data-del-step]');
      if(del){if(this.formData.steps.length>1){this.formData.steps.splice(+del.dataset.delStep,1);this.rebuildSteps();}return;}
      const rm=e.target.closest('[data-rm-step-img]');
      if(rm){this.formData.steps[+rm.dataset.rmStepImg].image=null;this.rebuildStepImgZone(+rm.dataset.rmStepImg);}
    });
    root.addEventListener('change',e=>{const input=e.target.closest('[data-img-input]');if(!input)return;const i=+input.dataset.imgInput,f=input.files[0];if(!f||!f.type.startsWith('image/'))return;const rdr=new FileReader();rdr.onload=ev=>{this.formData.steps[i].image=ev.target.result;this.rebuildStepImgZone(i);};rdr.readAsDataURL(f);input.value='';});
  },

  bindTagEvents(){
    const addTag=val=>{val=val.trim().replace(/,$/,'');if(val&&!this.formData.tags.includes(val)){this.formData.tags.push(val);this.rebuildTags();}};
    const tagInput=document.getElementById('tag-input');
    tagInput?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===',')&&tagInput.value.trim()){e.preventDefault();addTag(tagInput.value);}if(e.key==='Backspace'&&!tagInput.value&&this.formData.tags.length){this.formData.tags.pop();this.rebuildTags();}});
    document.getElementById('tags-box')?.addEventListener('click',e=>{const btn=e.target.closest('.tag-remove');if(btn){this.formData.tags.splice(+btn.dataset.tag,1);this.rebuildTags();}else document.getElementById('tag-input')?.focus();});
  },

  _pwStrength(pw) {
    const len    = pw.length >= 8;
    const upper  = /[A-Z]/.test(pw);
    const numSym = /[0-9!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(pw);
    return { len, upper, numSym, score: [len, upper, numSym].filter(Boolean).length };
  },

  _setAuthError(msg) {
    this.authError = msg;
    let el = document.querySelector('.auth-error');
    if (el) { el.textContent = msg; return; }
    el = document.createElement('div');
    el.className = 'auth-error';
    el.textContent = msg;
    document.getElementById('btn-auth-submit')?.before(el);
  },

  _addIngFromInput() {
    const nameInput = document.getElementById('ing-add-input');
    const name = (nameInput?.value || '').trim();
    if (!name) { nameInput?.focus(); return; }
    const qty = parseFloat(document.getElementById('ing-add-qty')?.value) || '';
    const unit = document.getElementById('ing-add-unit')?.value || 'g';
    this.formData.ingredients.push({ name, qty, unit });
    this.rebuildIngs();
    if (nameInput) { nameInput.value = ''; nameInput.focus(); }
    const qtyInput = document.getElementById('ing-add-qty');
    if (qtyInput) qtyInput.value = '';
  },

  rebuildIngs(){
    const b=document.getElementById('ing-builder');if(!b)return;
    b.innerHTML=this.formData.ingredients.map((ing,i)=>this.renderIngRow(ing,i)).join('');
    const h=document.querySelector('.ing-header');
    if(h)h.classList.toggle('ing-header-hidden', this.formData.ingredients.length===0);
    this.updateIngHelper();
  },
  rebuildSteps(){const b=document.getElementById('steps-builder');if(!b)return;b.innerHTML=this.formData.steps.map((s,i)=>this.renderStepRow(s,i)).join('');},
  rebuildStepImgZone(i){const z=document.getElementById(`step-img-zone-${i}`);if(!z)return;z.innerHTML=this.renderStepImgZone(this.formData.steps[i],i);},
  rebuildCoverImg(){const a=document.getElementById('cover-area');if(!a)return;a.innerHTML=this.renderCoverArea(this.formData.coverImage);this.bindCoverEvents();},
  rebuildTags(){const b=document.getElementById('tags-box');if(!b)return;b.innerHTML=this.formData.tags.map((t,i)=>`<span class="tag">${this.escHtml(t)}<button class="tag-remove" data-tag="${i}">✕</button></span>`).join('')+`<input type="text" class="tags-text-input" id="tag-input" placeholder="${this.formData.tags.length?'':this.t('tagsPh')}">`;document.getElementById('tag-input')?.focus();this.bindTagEvents();},
  updateIngHelper(){const h=document.getElementById('ing-ref-helper');if(!h)return;const names=this.formData.ingredients.filter(i=>i.name.trim()).map(i=>i.name.trim());h.style.display=names.length?'':'none';const span=h.querySelector('.ing-ref-names');if(span)span.innerHTML=names.map(n=>`<code>{${this.escHtml(n)}}</code>`).join(' ');},

  async saveRecipe() {
    const name=document.getElementById('f-name')?.value?.trim();
    if(!name){this.toast(this.t('nameWarn'));return;}
    if(!this.editingId&&!this.canAddRecipe()){this.showUpgradeModal();return;}
    const recipe={id:this.editingId||crypto.randomUUID(),name,category:document.getElementById('f-cat')?.value||'',basePeople:parseInt(document.getElementById('f-people')?.value)||4,prepTime:parseInt(document.getElementById('f-prep')?.value)||0,cookTime:parseInt(document.getElementById('f-cook')?.value)||0,description:document.getElementById('f-desc')?.value?.trim()||'',ingredients:this.formData.ingredients.filter(i=>i.name.trim()).map(i=>({...i,name:i.name.trim()})),steps:this.formData.steps.filter(s=>s.text.trim()),coverImage:this.formData.coverImage||null,images:[],tags:[...this.formData.tags],createdAt:this.editingId?(Store.byId(this.editingId)?.createdAt||new Date().toISOString()):new Date().toISOString(),updatedAt:new Date().toISOString(),authorId:this.user?.id||null,authorName:this.user?.name||this.user?.email?.split('@')[0]||''};
    if(this.editingId)Store.update(this.editingId,recipe);else Store.add(recipe);
    if(this.user){const{error}=await db.from('recipes').upsert({id:recipe.id,user_id:this.user.id,data:recipe,updated_at:recipe.updatedAt});if(error)this.toast(this.t('syncErr')+error.message);}
    this.toast(this.editingId?this.t('recipeUpdated'):this.t('recipeCreated'));
    this.nav('recipe',recipe.id);
    // Remove the create/edit entry nav() just pushed so back goes to list, not the form
    this.navStack = this.navStack.filter(e => e.view !== 'create' && e.view !== 'edit');
  },

  async deleteRecipeById(id){
    Store.delete(id);
    if(this.user){const{error}=await db.from('recipes').delete().eq('id',id);if(error)this.toast('⚠️ Erreur : '+error.message);}
    this.navStack = [];
    this.nav('list');this.toast(this.t('recipeDeleted'));
  },

  async saveProfile() {
    const name = (document.getElementById('profile-name-input')?.value || '').trim();
    const email = (document.getElementById('profile-email-input')?.value || '').trim();
    if (!this.user) return;
    const btn = document.querySelector('#btn-save-profile');
    if (btn) btn.disabled = true;
    try {
      const emailChanged = email && email !== this.user.email;
      if (name) {
        await db.from('profiles').update({ name }).eq('id', this.user.id);
        await db.auth.updateUser({ data: { full_name: name } });
        this.user.name = name;
      }
      if (emailChanged) await db.auth.updateUser({ email });
      const card = document.getElementById('profile-edit-card');
      if (card) card.hidden = true;
      this.renderContent();
      // Header badge: renderContent() doesn't touch the header so update it directly
      const hdr = document.getElementById('btn-go-account');
      if (hdr) {
        const initial = (this.user?.name?.[0] || this.user?.email?.[0] || '?').toUpperCase();
        hdr.innerHTML = this.avatarImg ? `<img src="${this.escHtml(this.avatarImg)}" class="avatar-photo" alt="">` : initial;
      }
      this.toast(emailChanged ? this.t('emailConfirmSent') : this.t('profileSaved'));
    } catch(e) {
      this.toast('⚠️ Erreur : ' + e.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  confirmDeleteAccount() {
    const overlay = document.createElement('div');
    overlay.className = 'upgrade-overlay';
    const confirmWord = this.t('deleteConfirmWord');
    overlay.innerHTML = `
      <div class="upgrade-modal" style="max-width:420px">
        <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
        <h2 style="color:#C0392B;margin-bottom:12px">${this.t('deleteAccountTitle')}</h2>
        <p style="color:var(--brown);line-height:1.6">${this.t('deleteAccountDesc')}</p>
        <p style="margin-top:14px;color:var(--brown);font-size:0.9rem">${this.t('deleteConfirmPrompt')}</p>
        <input type="text" id="delete-confirm-input" placeholder="${confirmWord}" autocomplete="off"
          style="margin-top:10px;text-transform:uppercase;letter-spacing:0.08em;text-align:center">
        <div class="upgrade-actions" style="margin-top:20px">
          <button type="button" class="btn-ghost btn-full" id="btn-cancel-delete">${this.t('cancelBtn')}</button>
          <button type="button" class="btn-full" id="btn-confirm-delete" disabled
            style="background:#C0392B;color:white;border:none;padding:12px 24px;border-radius:50px;font-family:var(--font-sans);font-size:0.9rem;font-weight:600;cursor:pointer;opacity:0.45;transition:opacity 0.2s">
            ${this.t('deleteForever')}
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#delete-confirm-input');
    const confirmBtn = overlay.querySelector('#btn-confirm-delete');
    input.focus();
    input.addEventListener('input', () => {
      const ok = input.value.toUpperCase() === confirmWord;
      confirmBtn.disabled = !ok;
      confirmBtn.style.opacity = ok ? '1' : '0.45';
    });
    overlay.querySelector('#btn-cancel-delete').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Suppression…';
      await this.deleteAccount();
      overlay.remove();
    });
  },

  async deleteAccount() {
    if (!this.user) return;
    const uid = this.user.id;
    // Delete all user data from Supabase
    await db.from('recipes').delete().eq('user_id', uid).catch(() => {});
    await db.from('likes').delete().eq('user_id', uid).catch(() => {});
    await db.from('saves').delete().eq('user_id', uid).catch(() => {});
    await db.from('profiles').delete().eq('id', uid).catch(() => {});
    // Try RPC for full auth deletion (requires migration_delete_account.sql)
    await db.rpc('delete_my_account').catch(() => {});
    // Clear local data
    localStorage.removeItem('gustos_avatar_' + uid);
    localStorage.removeItem('gustos_seeded_v1');
    Store.clear();
    await db.auth.signOut();
  },

  handleAvatarUpload(file) {
    if (!file || !this.user) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const raw = ev.target.result;
      // Show raw preview immediately — no waiting for canvas
      const preview = document.getElementById('profile-avatar-preview');
      if (preview) preview.innerHTML = `<img src="${raw}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block" alt="">`;
      // Compress in background then save
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 200;
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          const scale = Math.max(size / img.width, size / img.height);
          const sw = size / scale, sh = size / scale;
          ctx.drawImage(img, (img.width-sw)/2, (img.height-sh)/2, sw, sh, 0, 0, size, size);
          this._storeAvatar(canvas.toDataURL('image/jpeg', 0.85));
        } catch { this._storeAvatar(raw); }
      };
      img.onerror = () => this._storeAvatar(raw);
      img.src = raw;
    };
    reader.readAsDataURL(file);
  },

  _storeAvatar(b64) {
    this.avatarImg = b64;
    localStorage.setItem('gustos_avatar_' + this.user.id, b64);
    db.from('profiles').update({ avatar_url: b64 }).eq('id', this.user.id).catch(() => {});
  },

  async seedDefaultRecipes(silent = false) {
    const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36);
    const now = new Date().toISOString();
    const existingNames = new Set(Store.get().map(r => r.name));
    const allRecipes = [
      {
        name: 'Lasagnes au pesto', category: 'Pâtes',
        description: 'Des lasagnes crémeuses au pesto vert — rapides, parfumées et toujours appréciées.',
        basePeople: 4, prepTime: 15, cookTime: 35,
        tags: ['végétarien', 'pesto', 'pâtes', 'gratiné'],
        ingredients: [
          { name: 'feuilles de lasagne', qty: 12, unit: 'pièce(s)' },
          { name: 'pesto vert', qty: 200, unit: 'g' },
          { name: 'ricotta', qty: 500, unit: 'g' },
          { name: 'mozzarella', qty: 250, unit: 'g' },
          { name: 'parmesan râpé', qty: 80, unit: 'g' },
          { name: 'crème fraîche', qty: 100, unit: 'ml' },
        ],
        steps: [
          'Préchauffer le four à 180°C.',
          'Mélanger la {ricotta} avec le {pesto vert} et la {crème fraîche}. Saler et poivrer.',
          'Dans un plat à gratin, déposer une fine couche de mélange au fond.',
          'Alterner : couche de {feuilles de lasagne}, mélange ricotta-pesto, tranches de {mozzarella}. Répéter sur 3 couches.',
          'Terminer par le mélange ricotta-pesto et saupoudrer de {parmesan râpé}.',
          'Enfourner 35 min jusqu\'à ce que le dessus soit doré et bouillonnant.',
          'Laisser reposer 5 min avant de servir.',
        ],
      },
      {
        name: 'Ratatouille provençale', category: 'Légumes',
        description: 'Le classique estival du Sud — courgettes, aubergines et tomates mijotées aux herbes de Provence.',
        basePeople: 4, prepTime: 20, cookTime: 45,
        tags: ['végétarien', 'provençal', 'été', 'mijotée'],
        ingredients: [
          { name: 'aubergine', qty: 2, unit: 'pièce(s)' },
          { name: 'courgette', qty: 2, unit: 'pièce(s)' },
          { name: 'poivron rouge', qty: 2, unit: 'pièce(s)' },
          { name: 'tomates', qty: 4, unit: 'pièce(s)' },
          { name: 'oignon', qty: 2, unit: 'pièce(s)' },
          { name: 'ail', qty: 4, unit: 'gousse(s)' },
          { name: 'huile d\'olive', qty: 4, unit: 'cs' },
          { name: 'herbes de Provence', qty: 2, unit: 'cc' },
        ],
        steps: [
          'Couper tous les légumes en dés d\'environ 2 cm.',
          'Faire revenir l\'{oignon} et l\'{ail} dans l\'{huile d\'olive} à feu moyen, 5 min.',
          'Ajouter l\'{aubergine} et cuire 5 min en remuant.',
          'Incorporer la {courgette} et le {poivron rouge}. Cuire 5 min de plus.',
          'Ajouter les {tomates} et les {herbes de Provence}. Saler, poivrer.',
          'Couvrir et laisser mijoter à feu doux 30 min en remuant de temps en temps.',
          'Servir chaud ou tiède, avec du pain grillé ou du riz.',
        ],
      },
      {
        name: 'Poulet rôti aux herbes', category: 'Viandes',
        description: 'Un poulet rôti parfumé au thym, romarin et citron — croustillant dehors, fondant dedans.',
        basePeople: 4, prepTime: 10, cookTime: 75,
        tags: ['poulet', 'rôti', 'herbes', 'dimanche'],
        ingredients: [
          { name: 'poulet entier', qty: 1, unit: 'pièce(s)' },
          { name: 'beurre', qty: 50, unit: 'g' },
          { name: 'citron', qty: 1, unit: 'pièce(s)' },
          { name: 'ail', qty: 4, unit: 'gousse(s)' },
          { name: 'thym', qty: 4, unit: 'branche(s)' },
          { name: 'romarin', qty: 2, unit: 'branche(s)' },
          { name: 'huile d\'olive', qty: 2, unit: 'cs' },
        ],
        steps: [
          'Préchauffer le four à 200°C.',
          'Mélanger le {beurre} ramolli avec le zeste du {citron}, l\'{ail} écrasé, le sel et le poivre.',
          'Glisser le beurre aromatisé sous la peau du {poulet entier} et enduire la surface d\'{huile d\'olive}.',
          'Farcir la cavité avec les branches de {thym}, {romarin} et le reste du {citron} coupé en deux.',
          'Enfourner 1h15, en arrosant toutes les 20 min avec le jus de cuisson.',
          'Laisser reposer 10 min sous du papier aluminium avant de découper.',
        ],
      },
      {
        name: 'Risotto aux champignons', category: 'Riz',
        description: 'Un risotto crémeux aux champignons de Paris et shiitakés, fini au parmesan.',
        basePeople: 4, prepTime: 10, cookTime: 30,
        tags: ['végétarien', 'champignons', 'crémeux', 'comfort food'],
        ingredients: [
          { name: 'riz arborio', qty: 320, unit: 'g' },
          { name: 'champignons de Paris', qty: 250, unit: 'g' },
          { name: 'shiitakés', qty: 150, unit: 'g' },
          { name: 'bouillon de légumes', qty: 1.2, unit: 'L' },
          { name: 'vin blanc sec', qty: 120, unit: 'ml' },
          { name: 'échalote', qty: 2, unit: 'pièce(s)' },
          { name: 'parmesan râpé', qty: 80, unit: 'g' },
          { name: 'beurre', qty: 40, unit: 'g' },
        ],
        steps: [
          'Faire chauffer le {bouillon de légumes} dans une casserole à feu doux.',
          'Dans une grande poêle, faire revenir l\'{échalote} émincée dans la moitié du {beurre} pendant 3 min.',
          'Ajouter les {champignons de Paris} et {shiitakés} tranchés. Cuire 5 min.',
          'Incorporer le {riz arborio} et le nacrer 2 min en remuant.',
          'Verser le {vin blanc sec} et laisser absorber complètement.',
          'Ajouter le bouillon louche par louche en remuant constamment, en attendant l\'absorption à chaque fois (20 min).',
          'Hors du feu, incorporer le reste du {beurre} et le {parmesan râpé}. Assaisonner et servir immédiatement.',
        ],
      },
      {
        name: 'Soupe à l\'oignon gratinée', category: 'Soupes',
        description: 'La soupe à l\'oignon traditionnelle parisienne, avec sa croûte de gruyère fondu.',
        basePeople: 4, prepTime: 10, cookTime: 50,
        tags: ['bistrot', 'gratiné', 'hiver', 'fromage'],
        ingredients: [
          { name: 'oignons', qty: 1, unit: 'kg' },
          { name: 'bouillon de bœuf', qty: 1.5, unit: 'L' },
          { name: 'vin blanc sec', qty: 100, unit: 'ml' },
          { name: 'beurre', qty: 40, unit: 'g' },
          { name: 'tranches de pain rassis', qty: 8, unit: 'pièce(s)' },
          { name: 'gruyère râpé', qty: 200, unit: 'g' },
          { name: 'farine', qty: 1, unit: 'cs' },
        ],
        steps: [
          'Émincer finement les {oignons}.',
          'Faire fondre le {beurre} dans une grande cocotte, ajouter les {oignons} et caraméliser à feu doux 30 min en remuant souvent.',
          'Saupoudrer de {farine} et mélanger 2 min.',
          'Verser le {vin blanc sec}, laisser réduire 3 min, puis ajouter le {bouillon de bœuf}.',
          'Cuire à feu doux 15 min. Assaisonner.',
          'Verser la soupe dans des bols allant au four. Disposer les {tranches de pain rassis} dessus et couvrir de {gruyère râpé}.',
          'Passer sous le grill 5 min jusqu\'à ce que le fromage soit doré et bouillonnant.',
        ],
      },
      {
        name: 'Quiche lorraine', category: 'Tartes',
        description: 'La quiche classique à la crème et aux lardons — simple, généreuse et toujours réussie.',
        basePeople: 6, prepTime: 15, cookTime: 35,
        tags: ['lorraine', 'lardons', 'crème', 'entrée'],
        ingredients: [
          { name: 'pâte brisée', qty: 1, unit: 'pièce(s)' },
          { name: 'lardons fumés', qty: 200, unit: 'g' },
          { name: 'crème fraîche épaisse', qty: 250, unit: 'ml' },
          { name: 'œufs', qty: 3, unit: 'pièce(s)' },
          { name: 'gruyère râpé', qty: 80, unit: 'g' },
          { name: 'muscade', qty: 1, unit: 'pincée' },
        ],
        steps: [
          'Préchauffer le four à 180°C.',
          'Foncer un moule à tarte avec la {pâte brisée}. Piquer le fond avec une fourchette et précuire 10 min à blanc.',
          'Faire revenir les {lardons fumés} à la poêle sans matière grasse jusqu\'à légère dorure.',
          'Battre les {œufs} avec la {crème fraîche épaisse}, saler légèrement, poivrer, ajouter la {muscade}.',
          'Répartir les {lardons fumés} sur le fond de tarte, verser l\'appareil à crème, parsemer de {gruyère râpé}.',
          'Cuire 35 min jusqu\'à ce que la quiche soit dorée et prise au centre.',
          'Laisser tiédir 5 min avant de servir, avec une salade verte.',
        ],
      },
      {
        name: 'Bœuf bourguignon', category: 'Viandes',
        description: 'Le grand classique bourguignon — bœuf mijoté au vin rouge avec carottes, lardons et champignons.',
        basePeople: 6, prepTime: 30, cookTime: 180,
        tags: ['bœuf', 'mijoté', 'vin rouge', 'dimanche', 'hiver'],
        ingredients: [
          { name: 'bœuf à braiser (paleron ou joue)', qty: 1.2, unit: 'kg' },
          { name: 'vin rouge de Bourgogne', qty: 75, unit: 'cl' },
          { name: 'lardons fumés', qty: 150, unit: 'g' },
          { name: 'champignons de Paris', qty: 250, unit: 'g' },
          { name: 'carottes', qty: 3, unit: 'pièce(s)' },
          { name: 'oignons', qty: 2, unit: 'pièce(s)' },
          { name: 'ail', qty: 3, unit: 'gousse(s)' },
          { name: 'bouquet garni', qty: 1, unit: 'pièce(s)' },
          { name: 'farine', qty: 2, unit: 'cs' },
          { name: 'huile', qty: 3, unit: 'cs' },
        ],
        steps: [
          'Couper le {bœuf à braiser (paleron ou joue)} en gros cubes. Saler, poivrer et fariner légèrement.',
          'Faire dorer les cubes de bœuf dans l\'{huile} sur toutes les faces. Réserver.',
          'Dans la même cocotte, faire revenir les {lardons fumés}, les {oignons} émincés et l\'{ail} 5 min.',
          'Remettre le bœuf, ajouter les {carottes} en rondelles, le {bouquet garni} et verser le {vin rouge de Bourgogne}.',
          'Porter à ébullition, écumer, puis couvrir et laisser mijoter à feu très doux 2h30.',
          'Ajouter les {champignons de Paris} coupés en quartiers 30 min avant la fin de cuisson.',
          'Retirer le {bouquet garni}. Vérifier l\'assaisonnement. Servir avec des pommes de terre vapeur ou des pâtes.',
        ],
      },
      {
        name: 'Crêpes sucrées maison', category: 'Desserts',
        description: 'La pâte à crêpes inratable — légère, dorée et parfumée au beurre noisette.',
        basePeople: 4, prepTime: 10, cookTime: 20,
        tags: ['dessert', 'crêpes', 'breton', 'rapide'],
        ingredients: [
          { name: 'farine', qty: 250, unit: 'g' },
          { name: 'lait', qty: 500, unit: 'ml' },
          { name: 'œufs', qty: 3, unit: 'pièce(s)' },
          { name: 'beurre fondu', qty: 40, unit: 'g' },
          { name: 'sucre', qty: 30, unit: 'g' },
          { name: 'sel', qty: 1, unit: 'pincée' },
          { name: 'extrait de vanille', qty: 1, unit: 'cc' },
        ],
        steps: [
          'Dans un saladier, mélanger la {farine}, le {sucre} et le {sel}.',
          'Ajouter les {œufs} un par un en mélangeant bien.',
          'Incorporer progressivement le {lait} pour éviter les grumeaux. Ajouter le {beurre fondu} et l\'{extrait de vanille}.',
          'Laisser reposer la pâte 30 min à température ambiante (facultatif mais recommandé).',
          'Faire chauffer une poêle antiadhésive à feu moyen-vif. Huiler légèrement.',
          'Verser une petite louche de pâte, incliner la poêle pour étaler en fine couche.',
          'Cuire 1 min jusqu\'à ce que les bords se décollent, retourner et cuire 30 sec. Servir avec beurre, sucre, confiture ou Nutella.',
        ],
      },
      {
        name: 'Taboulé libanais', category: 'Salades',
        description: 'Un taboulé frais et généreux — beaucoup de persil, peu de boulgour, tomates et citron.',
        basePeople: 4, prepTime: 20, cookTime: 0,
        tags: ['végétarien', 'libanais', 'frais', 'été', 'sans cuisson'],
        ingredients: [
          { name: 'boulgour fin', qty: 80, unit: 'g' },
          { name: 'persil plat', qty: 2, unit: 'botte(s)' },
          { name: 'menthe fraîche', qty: 1, unit: 'botte(s)' },
          { name: 'tomates', qty: 3, unit: 'pièce(s)' },
          { name: 'citrons', qty: 2, unit: 'pièce(s)' },
          { name: 'huile d\'olive', qty: 5, unit: 'cs' },
          { name: 'oignons verts', qty: 4, unit: 'tige(s)' },
        ],
        steps: [
          'Réhydrater le {boulgour fin} avec 80 ml d\'eau bouillante. Laisser gonfler 15 min, puis égoutter et refroidir.',
          'Ciseler finement le {persil plat} et la {menthe fraîche}.',
          'Couper les {tomates} en très petits dés. Émincer les {oignons verts}.',
          'Presser les {citrons}. Mélanger le jus avec l\'{huile d\'olive}, sel et poivre.',
          'Mélanger le {boulgour fin}, les herbes, les {tomates} et les {oignons verts}.',
          'Verser la vinaigrette au citron, mélanger. Goûter et ajuster l\'assaisonnement.',
          'Réfrigérer au moins 30 min avant de servir — le taboulé est meilleur frais.',
        ],
      },
      {
        name: 'Tarte tatin aux pommes', category: 'Desserts',
        description: 'La tarte renversée caramélisée — pommes fondantes et caramel beurré sous une pâte croustillante.',
        basePeople: 6, prepTime: 20, cookTime: 40,
        tags: ['dessert', 'pommes', 'caramel', 'tarte', 'classique'],
        ingredients: [
          { name: 'pommes (type Reine des Reinettes)', qty: 1.2, unit: 'kg' },
          { name: 'beurre', qty: 80, unit: 'g' },
          { name: 'sucre', qty: 150, unit: 'g' },
          { name: 'pâte feuilletée', qty: 1, unit: 'rouleau' },
          { name: 'jus de citron', qty: 1, unit: 'cs' },
        ],
        steps: [
          'Préchauffer le four à 190°C.',
          'Dans une poêle allant au four (ou moule à tatin), faire fondre le {beurre} avec le {sucre} à feu moyen jusqu\'à obtenir un caramel brun doré.',
          'Peler et couper les {pommes (type Reine des Reinettes)} en quartiers. Les arroser du {jus de citron}.',
          'Disposer les quartiers de pommes en cercles serrés dans le caramel, côté courbe vers le bas.',
          'Cuire 10 min à feu moyen pour précuire les pommes dans le caramel.',
          'Recouvrir les pommes avec la {pâte feuilletée} découpée en cercle. Rentrer les bords à l\'intérieur du moule.',
          'Enfourner 25-30 min jusqu\'à ce que la pâte soit bien dorée. Laisser tiédir 10 min puis retourner sur un plat. Servir tiède avec de la crème fraîche.',
        ],
      },
    ];
    const toAdd = allRecipes.filter(r => !existingNames.has(r.name)).map(r => ({
      ...r, id: uid(), coverImage: null, createdAt: now, updatedAt: now,
    }));
    for (const r of toAdd) {
      Store.add(r);
      if (this.user) await db.from('recipes').upsert({ id: r.id, user_id: this.user.id, data: r, updated_at: r.updatedAt }).catch(() => {});
    }
    if (!silent) { this.renderContent(); this.toast(`${toAdd.length} recette(s) ajoutée(s) !`); }
  },

  showUpgradeModal(){
    const m=document.createElement('div');m.className='upgrade-overlay';
    m.innerHTML=`<div class="upgrade-modal"><div class="upgrade-icon">🔒</div><h2>${this.t('limitTitle')}</h2><p>${this.t('limitText',FREE_LIMIT)}</p><p>${this.t('limitText2')}</p><div class="upgrade-actions"><button class="btn-primary btn-full" id="btn-upgrade-pro">${this.t('upgradeProBtn')}</button><button class="btn-ghost btn-full" id="btn-upgrade-later">${this.t('laterBtn')}</button></div></div>`;
    document.body.appendChild(m);
    m.querySelector('#btn-upgrade-pro')?.addEventListener('click',()=>{this.toast(this.t('comingSoon'));m.remove();});
    m.querySelector('#btn-upgrade-later')?.addEventListener('click',()=>m.remove());
    m.addEventListener('click',e=>{if(e.target===m)m.remove();});
  },

  showLightbox(src){
    const lb=document.createElement('div');lb.className='lightbox';lb.innerHTML=`<div class="lightbox-bg"></div><img class="lightbox-img" src="${src}">`;
    document.body.appendChild(lb);lb.addEventListener('click',()=>lb.remove());
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){lb.remove();document.removeEventListener('keydown',esc);}});
  },

  toast(msg){document.querySelector('.toast')?.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);},
  escHtml(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');},

  // ===== PLANNING =====
  getWeekStart(d) {
    const date = new Date(d);
    const dow = date.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    date.setDate(date.getDate() + diff);
    return date.toISOString().slice(0, 10);
  },
  offsetWeek(iso, days) {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  },
  getWeekDays(weekStart) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart + 'T12:00:00');
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  },
  formatWeekLabel(iso) {
    const s = new Date(iso + 'T12:00:00');
    const e = new Date(iso + 'T12:00:00');
    e.setDate(e.getDate() + 6);
    const locale = this.lang === 'en' ? 'en-GB' : this.lang === 'es' ? 'es-ES' : this.lang === 'it' ? 'it-IT' : 'fr-FR';
    const opt = { day: 'numeric', month: 'long' };
    return `${s.toLocaleDateString(locale, opt)} — ${e.toLocaleDateString(locale, { ...opt, year: 'numeric' })}`;
  },

  loadPlanLocal() {
    try { this.plan = JSON.parse(localStorage.getItem('gustos_plan') || '{}'); } catch { this.plan = {}; }
    try { this.shopping = JSON.parse(localStorage.getItem('gustos_shopping') || '[]'); } catch { this.shopping = []; }
    try { this.planPortions = JSON.parse(localStorage.getItem('gustos_portions') || '{}'); } catch { this.planPortions = {}; }
  },
  savePlan() {
    localStorage.setItem('gustos_plan', JSON.stringify(this.plan));
    localStorage.setItem('gustos_shopping', JSON.stringify(this.shopping));
    localStorage.setItem('gustos_portions', JSON.stringify(this.planPortions));
    if (this.user) {
      db.from('meal_plans').upsert({
        user_id: this.user.id, week_of: this.planWeek,
        plan: this.plan[this.planWeek] || {}, shopping: this.shopping,
        updated_at: new Date().toISOString()
      }).then(({ error }) => { if (error) console.warn('[Plan]', error.message); });
    }
  },
  async loadPlan() {
    this.loadPlanLocal();
    if (!this.user) return;
    const { data, error } = await db.from('meal_plans').select('week_of,plan,shopping').eq('user_id', this.user.id);
    if (error) { console.warn('[Plan]', error.message); return; }
    if (data) {
      data.forEach(row => { this.plan[row.week_of] = row.plan; });
      const cur = data.find(r => r.week_of === this.planWeek);
      if (cur && cur.shopping?.length) this.shopping = cur.shopping;
      localStorage.setItem('gustos_plan', JSON.stringify(this.plan));
      localStorage.setItem('gustos_shopping', JSON.stringify(this.shopping));
    }
  },

  addToPlan(date, meal, recipeId) {
    if (!this.plan[date]) this.plan[date] = { lunch: [], dinner: [] };
    if (!this.plan[date][meal]) this.plan[date][meal] = [];
    if (!this.plan[date][meal].includes(recipeId)) {
      this.plan[date][meal].push(recipeId);
      const r = Store.byId(recipeId);
      this.planPortions[`${date}|${meal}|${recipeId}`] = r?.basePeople || 4;
    }
    this.generateShoppingList(); this.savePlan();
  },
  removeFromPlan(date, meal, recipeId) {
    if (this.plan[date]?.[meal]) this.plan[date][meal] = this.plan[date][meal].filter(id => id !== recipeId);
    delete this.planPortions[`${date}|${meal}|${recipeId}`];
    this.generateShoppingList(); this.savePlan();
  },

  generateShoppingList() {
    const merged = {};
    for (const date of this.getWeekDays(this.planWeek)) {
      const slots = this.plan[date] || {};
      for (const meal of ['lunch', 'dinner']) {
        for (const rid of (slots[meal] || [])) {
          const r = Store.byId(rid);
          if (!r) continue;
          const portions = this.planPortions[`${date}|${meal}|${rid}`] || r.basePeople || 4;
          const ratio = portions / (r.basePeople || portions);
          for (const ing of r.ingredients) {
            const key = `${ing.name.trim().toLowerCase()}|||${(ing.unit || '').toLowerCase()}`;
            const scaledQty = (parseFloat(ing.qty) || 0) * ratio;
            if (merged[key]) {
              merged[key].qty = (merged[key].qty || 0) + scaledQty;
              if (!merged[key].sources.includes(r.name)) merged[key].sources.push(r.name);
            } else {
              merged[key] = { id: key, name: ing.name, qty: scaledQty, unit: ing.unit || '', sources: [r.name], checked: false, manual: false };
            }
          }
        }
      }
    }
    const prevChecked = new Set(this.shopping.filter(i => i.checked && !i.manual).map(i => `${i.name.trim().toLowerCase()}|||${(i.unit||'').toLowerCase()}`));
    const manualItems = this.shopping.filter(i => i.manual);
    const autoItems = Object.values(merged).map(item => ({ ...item, checked: prevChecked.has(`${item.name.trim().toLowerCase()}|||${(item.unit||'').toLowerCase()}`) }));
    this.shopping = [...autoItems, ...manualItems];
  },

  toggleShoppingItem(id) {
    const item = this.shopping.find(i => i.id === id);
    if (!item) return;
    item.checked = !item.checked;
    this.savePlan();
    const el = document.querySelector(`[data-item-id="${id}"]`);
    if (!el) return;
    el.classList.toggle('checked', item.checked);
    const btn = el.querySelector('[data-check-item]');
    if (btn) { btn.classList.toggle('ticked', item.checked); btn.textContent = item.checked ? '✓' : ''; }
  },
  removeShoppingItem(id) {
    this.shopping = this.shopping.filter(i => i.id !== id);
    this.savePlan(); this.renderContent();
  },
  addManualItem(name, qty, unit) {
    if (!name.trim()) return;
    this.shopping.push({ id: crypto.randomUUID(), name: name.trim(), qty: parseFloat(qty) || null, unit: (unit || '').trim(), sources: [], checked: false, manual: true });
    this.savePlan(); this.renderContent();
  },
  clearCheckedItems() {
    this.shopping = this.shopping.filter(i => !i.checked);
    this.savePlan(); this.renderContent();
  },

  renderMealPlanner() {
    const days = this.getWeekDays(this.planWeek);
    const locale = this.lang === 'en' ? 'en-GB' : this.lang === 'de' ? 'de-DE' : this.lang === 'es' ? 'es-ES' : this.lang === 'it' ? 'it-IT' : 'fr-FR';
    const DAY_SHORT = this.lang === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      : this.lang === 'de' ? ['Mo','Di','Mi','Do','Fr','Sa','So']
      : this.lang === 'es' ? ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
      : this.lang === 'it' ? ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']
      : ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const today = new Date().toISOString().slice(0, 10);
    const prevW = this.offsetWeek(this.planWeek, -7);
    const nextW = this.offsetWeek(this.planWeek, 7);
    const autoItems = this.shopping.filter(i => !i.manual);
    const manualItems = this.shopping.filter(i => i.manual);
    const total = this.shopping.length;
    const checked = this.shopping.filter(i => i.checked).length;
    return `<div class="view-planner">
      <div class="planner-topbar">
        <button class="btn-ghost" id="btn-back-planner">${this.t('back')}</button>
        <h2 class="planner-title">📅 ${this.t('plannerTitle')}</h2>
      </div>
      <div class="week-nav-bar">
        <button class="btn-week-nav" data-goto-week="${prevW}">←</button>
        <span class="week-label">${this.formatWeekLabel(this.planWeek)}</span>
        <button class="btn-week-nav" data-goto-week="${nextW}">→</button>
      </div>
      <div class="planner-grid">
        ${days.map((date, i) => {
          const slots = this.plan[date] || {};
          const isToday = date === today;
          const dayDate = new Date(date + 'T12:00:00');
          const dayNum = dayDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
          return `<div class="planner-day${isToday ? ' today' : ''}">
            <div class="planner-day-head">
              <span class="day-name">${DAY_SHORT[i]}</span>
              <span class="day-date">${dayNum}</span>
            </div>
            <div class="planner-meal">
              <div class="meal-label">${this.t('lunch')}</div>
              ${this.renderMealSlots(date, 'lunch', slots.lunch || [])}
            </div>
            <div class="planner-meal">
              <div class="meal-label">${this.t('dinner')}</div>
              ${this.renderMealSlots(date, 'dinner', slots.dinner || [])}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="shopping-section">
        <div class="shopping-header">
          <h3>${this.t('shoppingTitle')}</h3>
          <div class="shopping-hdr-actions">
            ${total > 0 ? `<span class="shop-progress">${checked}/${total}</span>` : ''}
            ${checked > 0 ? `<button class="btn-ghost btn-sm" id="btn-clear-checked">${this.t('clearChecked')}</button>` : ''}
            <button class="btn-secondary btn-sm" id="btn-regen">${this.t('refreshList')}</button>
          </div>
        </div>
        ${total === 0 ? `<div class="shopping-empty"><span>🛒</span><p>${this.t('shoppingEmpty')}</p></div>` : ''}
        <div class="shopping-items" id="shopping-items">
          ${autoItems.length ? `<div class="shop-group-lbl">${this.t('shopGroupAuto')}</div>${autoItems.map(i => this.renderShopItem(i)).join('')}` : ''}
          ${manualItems.length ? `<div class="shop-group-lbl">${this.t('shopGroupManual')}</div>${manualItems.map(i => this.renderShopItem(i)).join('')}` : ''}
        </div>
        <div class="shopping-add-row">
          <div class="shop-add-field">
            <label class="shop-add-label">Nom</label>
            <input type="text" id="manual-name" placeholder="${this.t('addItemPh')}" autocomplete="off">
          </div>
          <div class="shop-add-field shop-add-field-qty">
            <label class="shop-add-label">Qté</label>
            <input type="number" id="manual-qty" placeholder="100" min="0" step="any">
          </div>
          <div class="shop-add-field shop-add-field-unit">
            <label class="shop-add-label">Unité</label>
            <select id="manual-unit">${UNITS.map(u => `<option>${u}</option>`).join('')}</select>
          </div>
          <button class="btn-primary btn-sm" id="btn-add-manual">${this.t('addItemBtn')}</button>
        </div>
      </div>
      ${this.pickerOpen ? this.renderRecipePicker() : ''}
    </div>`;
  },

  renderMealSlots(date, meal, ids) {
    return (ids || []).map(id => {
      const r = Store.byId(id);
      if (!r) return '';
      const cover = this.getCover(r);
      const emoji = CAT_EMOJI[r.category] || '🍴';
      const portions = this.planPortions[`${date}|${meal}|${id}`] || r.basePeople || 4;
      return `<div class="plan-chip">
        <div class="chip-thumb">${cover ? `<img src="${cover}" loading="lazy">` : `<span>${emoji}</span>`}</div>
        <button class="chip-name-btn" data-open-recipe="${id}" data-open-portions="${portions}" title="${this.t('viewRecipeTip')}">${this.escHtml(r.name)}</button>
        <div class="chip-portions">
          <button class="chip-port-btn" data-port-dir="-1" data-port-date="${date}" data-port-meal="${meal}" data-port-id="${id}">−</button>
          <span class="chip-port-val">${portions}</span>
          <button class="chip-port-btn" data-port-dir="1" data-port-date="${date}" data-port-meal="${meal}" data-port-id="${id}">+</button>
        </div>
        <button class="chip-del" data-rm-date="${date}" data-rm-meal="${meal}" data-rm-id="${id}">✕</button>
      </div>`;
    }).join('') + `<button class="plan-add-btn" data-add-date="${date}" data-add-meal="${meal}">+ Ajouter</button>`;
  },

  renderShopItem(item) {
    const qty = item.qty ? `${this.fmtQty(item.qty)}${item.unit ? ' ' + item.unit : ''}` : '';
    return `<div class="shop-item${item.checked ? ' checked' : ''}" data-item-id="${item.id}">
      <button class="shop-check${item.checked ? ' ticked' : ''}" data-check-item="${item.id}">${item.checked ? '✓' : ''}</button>
      <div class="shop-body">
        <span class="shop-name">${this.escHtml(item.name)}</span>
        ${qty ? `<span class="shop-qty">${qty}</span>` : ''}
        ${item.manual ? `<span class="shop-new-badge">${this.t('newItemBadge')}</span>` : (item.sources?.length ? `<span class="shop-source">${item.sources.map(s => this.escHtml(s)).join(', ')}</span>` : '')}
      </div>
      <button class="shop-del" data-del-item="${item.id}">✕</button>
    </div>`;
  },

  _pickerPool() {
    const all = Store.get();
    if (this.pickerTab === 'liked') return all.filter(r => this.likedIds.has(r.id));
    if (this.pickerTab === 'saved') return all.filter(r => this.savedIds.has(r.id));
    return all;
  },
  _pickerShown() {
    const q = (this.pickerQuery || '').toLowerCase();
    const pool = this._pickerPool();
    return q ? pool.filter(r => r.name.toLowerCase().includes(q) || (r.category||'').toLowerCase().includes(q)) : pool;
  },
  _pickerCardHTML(r) {
    const cover = this.getCover(r);
    const emoji = CAT_EMOJI[r.category] || '🍴';
    const total = (r.prepTime||0) + (r.cookTime||0);
    const liked = this.likedIds.has(r.id);
    const saved = this.savedIds.has(r.id);
    return `<button class="picker-card" data-pick="${r.id}">
      <div class="picker-card-img">${cover ? `<img src="${cover}" loading="lazy">` : `<span>${emoji}</span>`}</div>
      <div class="picker-card-body">
        <div class="picker-card-name">${this.escHtml(r.name)}</div>
        <div class="picker-card-meta">
          ${r.category ? `<span class="picker-card-cat">${r.category}</span>` : ''}
          ${total ? `<span class="picker-card-time">⏱ ${total} min</span>` : ''}
        </div>
        <div class="picker-card-badges">${liked?'<span class="picker-badge">❤️</span>':''}${saved?'<span class="picker-badge">🔖</span>':''}</div>
      </div>
    </button>`;
  },
  _pickerEmptyHTML() {
    const q = this.pickerQuery;
    if (q) return `<div class="picker-empty-state"><span>🔍</span><p>Aucun résultat pour <strong>${this.escHtml(q)}</strong></p></div>`;
    if (this.pickerTab === 'liked') return `<div class="picker-empty-state"><span>❤️</span><p>Aucune recette aimée.<br><small>Ajoute des ❤️ sur les recettes que tu aimes.</small></p></div>`;
    if (this.pickerTab === 'saved') return `<div class="picker-empty-state"><span>🔖</span><p>Aucune recette sauvegardée.<br><small>Sauvegarde des recettes avec 🔖.</small></p></div>`;
    return `<div class="picker-empty-state"><span>🍽️</span><p>Aucune recette disponible.<br><small>Crée ta première recette !</small></p></div>`;
  },
  updatePickerList() {
    const list = document.querySelector('.picker-list');
    if (!list) return;
    const shown = this._pickerShown();
    list.innerHTML = shown.length === 0
      ? this._pickerEmptyHTML()
      : `<div class="picker-grid">${shown.map(r => this._pickerCardHTML(r)).join('')}</div>`;
    list.querySelectorAll('[data-pick]').forEach(btn => btn.addEventListener('click', () => {
      if (this.pickerOpen) { this.addToPlan(this.pickerOpen.date, this.pickerOpen.meal, btn.dataset.pick); this.pickerOpen = null; this.pickerQuery = ''; this.renderContent(); }
    }));
  },

  renderRecipePicker() {
    const all = Store.get();
    const likedCount = all.filter(r => this.likedIds.has(r.id)).length;
    const savedCount = all.filter(r => this.savedIds.has(r.id)).length;
    const shown = this._pickerShown();
    const tab = this.pickerTab;
    const mkTab = (id, label, count) =>
      `<button class="picker-tab${tab===id?' active':''}" data-picker-tab="${id}">${label}<span class="picker-tab-count">${count}</span></button>`;
    return `<div class="picker-overlay" id="picker-overlay">
      <div class="picker-modal">
        <div class="picker-head">
          <h3>Ajouter une recette</h3>
          <button class="picker-close-btn" id="btn-close-picker">✕</button>
        </div>
        <div class="picker-search-wrap">
          <span class="picker-search-icon">🔍</span>
          <input type="text" class="picker-search" id="picker-search" placeholder="Rechercher une recette…" value="${this.escHtml(this.pickerQuery||'')}">
          ${this.pickerQuery ? `<button class="picker-search-clear" id="btn-picker-clear">✕</button>` : ''}
        </div>
        <div class="picker-tabs">
          ${mkTab('all', 'Toutes', all.length)}
          ${mkTab('liked', '❤️ Aimées', likedCount)}
          ${mkTab('saved', '🔖 Sauvegardées', savedCount)}
        </div>
        <div class="picker-list">
          ${shown.length === 0
            ? this._pickerEmptyHTML()
            : `<div class="picker-grid">${shown.map(r => this._pickerCardHTML(r)).join('')}</div>`}
        </div>
      </div>
    </div>`;
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
