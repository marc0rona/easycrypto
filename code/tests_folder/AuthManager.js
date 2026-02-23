class AuthManager {
    // 1. priv+static VIDE pour qui ne soit jamais accéder ou instancer (elle est vide!)
    static _instance = null;

    // 2. constructeur privé
     constructor() {
        // Empeche creation de plusieurs instances ici
        if (AuthManager._instance) 
        { return AuthManager._instance; }

        // lock interne pour vérification (privé par convention)
        this._isAuthenticated = false;
        this._currentUser = null;

        console.log("Singleton AuthManager créé avec succès");
        // On save l’unique instance
        AuthManager._instance = this;
    }

    // 3. Getter statique (Lazy Initialization)
    static get Instance() 
    {   /*
        Lazy Initialization, pas besoin de lock :
        En JS ,l'instance est créer seulement au premier appel (single-threaded)
        Le modèle d'exécution JS agit déjà commeun lock implicite
        */

        if (AuthManager ._instance == null) 
        {  AuthManager._instance = new AuthManager();  }
        return AuthManager._instance;
    }

    /// MÉTHODES 
    login(username, password)
    {
        // Simulation simple seulement pour Tests 
        if (username == "Leboss" && password == "1234") 
        {
            this._isAuthenticated = true;
            this._currentUser = username;
            return true;
        }
        return false;
    }

    logout() {
        this._isAuthenticated = false;
        this._currentUser = null;
    }
    isLoggedIn() { return this._isAuthenticated; }
    getCurrentUser() { return this._currentUser;}
}