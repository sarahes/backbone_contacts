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

   //view for displaying a single contact - one model to one template 1:1
   var ContactView = Backbone.View.extend({
      //set some properties for the view 
      tagName: "article",
      className: "contact-container",
      template: $("#contactTemplate").html(),
 
      render: function () {
          //_.template is Underscore function
          var tmpl = _.template(this.template);
 
          this.$el.html(tmpl(this.model.toJSON()));
          return this;
    }
   });

  //master (like a list view) view to display all the contacts - collections
  var DirectoryView = Backbone.View.extend({
      el: $("#contacts"),

      initialize: function () {
        this.collection = new Directory(contacts);

        this.render();
        this.$el.find("#filter").append(this.createSelect()); 

        //bind event listeners to the collections
        this.on("change:filterType", this.filterByType, this);
        this.collection.on("reset", this.render, this);
      },
   
      render: function () {
        var that = this;

        this.$el.find("article").remove();

        _.each(this.collection.models, function (item) {
          that.renderContact(item);
        }, this);
      },
   
      renderContact: function (item) {
          var contactView = new ContactView({
              model: item
          });
          this.$el.append(contactView.render().el);
      },

      //get the type of contact from the contact array
      //underscore uniq() funcion accepts an array and returns a new array of unique items - in this case we are passing in the contacts array and returning a new array of types 
      getTypes: function () {
          return _.uniq(this.collection.pluck("type"), false, function (type) {
              return type.toLowerCase();
          });
      },
       
      //create and return select elements for each type (as determined by the getTypes method)
      createSelect: function () {
          var select = $("<select/>", {
            html: "<option value='all'>All</option>"
          });

          _.each(this.getTypes(), function (item) {
            var option = $("<option/>", {
              value: item,
              text: item
            }).appendTo(select);
          });

          return select;
      },

      //add ui events
      //the events attribute accepts an object of key:value pairs 
      //key specifies the type of event and value is a selector to bind the event handler to
      events: {
        "change #filter select": "setFilter"
      },

      //set filter property and fire change event
      setFilter: function (e) {
        this.filterType = e.currentTarget.value;
        this.trigger("change:filterType");
      },

      //filter the view
      filterByType: function () {
        if (this.filterType === "all") {
          this.collection.reset(contacts);
          contactsRouter.navigate("filter/all");
        }
        else {
          this.collection.reset(contacts, { silent: true });

          var filterType = this.filterType,
          filtered = _.filter(this.collection.models, function (item) {
            return item.get("type") === filterType;
          });

          this.collection.reset(filtered);

        }
      }

  });

  var directory = new DirectoryView();
 
} (jQuery));
