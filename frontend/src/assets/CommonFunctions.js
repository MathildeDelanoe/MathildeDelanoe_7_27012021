export const CommonFunctions = {
    formatInput: function(dataIn) {
        let lowercase = dataIn.toLowerCase();
        return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
    },

    errorManagement: function(errorCode) {
        // S'il y a une erreur, écriture d'un message correspondant à l'erreur
        let message = [];
        if (errorCode >= 300 && errorCode <= 399)
        {
            message = 'Erreur de redirection. Le contenu a bougé ou n\'est pas accessible directement';
        }
        else if (errorCode >= 400 && errorCode <= 499)
        {
            message = 'Erreur liée à l\'utilisation du service web';
        }
        else if (errorCode >= 500 && errorCode <= 599)
        {
            message = 'Erreur venant du service web';
        }
        else
        {
            message = 'Erreur d\'un autre type';
        }
        return message;
    }
};