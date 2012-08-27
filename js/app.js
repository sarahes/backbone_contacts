(function ($) {
 
    var contacts = [
        { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
    ];
    
    //create the Contact model and set some defaults
    var Contact = Backbone.Model.extend({
      defaults: {
          photo: "/img/placeholder.png"
      }
    });
   
   //create a collection from the Contact model
   var Directory = Backbone.Collection.extend({
      model: Contact
   });

   //view for displaying a single contact 
   var ContactView = Backbone.View.extend({
      tagName: "article",
      className: "contact-container",
      template: $("#contactTemplate").html(),
 
      render: function () {
          var tmpl = _.template(this.template);
 
          this.$el.html(tmpl(this.model.toJSON()));
          return this;
    }
   });
 
} (jQuery));
