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
          photo: "img/placeholder.png"
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

  //master (like a list view) view to display all the contacts - collection
  var DirectoryView = Backbone.View.extend({
      //assign the container div to a variable to append stuff to
      el: $("#contacts"),

      initialize: function () {
        this.collection = new Directory(contacts);

        this.render();

        //call the createSelect method to create the types drop down 
        this.$el.find("#filter").append(this.createSelect()); 

        //bind event listeners to the collection
        this.on("change:filterType", this.filterByType, this);
        this.collection.on("reset", this.render, this);

        //add new models to the view
        this.collection.on("add", this.renderContact, this);
      },
   
      render: function () {
        var that = this;

        //remove the contacts unrelated to filter, otherwise they will just be appended to the end of the list
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
      getTypes: function () {
           //underscore uniq() funcion accepts an array and returns a new array of unique items 
           //the pluck method is a simple way to pull all values of a single attribute out of a collection
          return _.uniq(this.collection.pluck("type"), false, function (type) {
              return type.toLowerCase();
          });
      },
       
      //create and return select elements for each type (as determined by the getTypes method) so it can be called later
      createSelect: function () {
          var select = $("<select/>", {
            html: "<option value='all'>All</option>"
          });

          //use the each() method to iterate over every item returned by the getTypes method
          _.each(this.getTypes(), function (item) {
            var option = $("<option/>", {
              value: item,
              text: item
            }).appendTo(select);
          });

          return select;
      },

      //add ui events - this is an attribute of DirectoryView
      //the events attribute accepts an object of key:value pairs 
      //key specifies the type of event and value is a selector to bind the event handler to
      events: {
        "change #filter select": "setFilter",
        "click #add": "addContact"
      },

      //add an event handler to be called when the select is changed 
      setFilter: function (e) {
        this.filterType = e.currentTarget.value;
        this.trigger("change:filterType");
      },

      //filter the view
      filterByType: function () {
          if (this.filterType === "all") {
              this.collection.reset(contacts);
       
              contactsRouter.navigate("filter/all");
       
          } else {
              this.collection.reset(contacts, { silent: true });
       
              //underscore  filter method accepts array to filter and a callback function to execute for each item in that array 
              var filterType = this.filterType,
                  filtered = _.filter(this.collection.models, function (item) {
                      //will return true for each item that has a type equal to the value of filterType
                      return item.get("type") === filterType;
              });
       
              //now call reset again and pass it the filtered array (containing only items with the filterType)
              this.collection.reset(filtered);
      
              contactsRouter.navigate("filter/" + filterType);
          }
      },

      //method to add a new contact model to the contacts collection 
      //add a new contact
      addContact: function (e) {
        //prevent the page from reloading
        e.preventDefault();

        //create a new array that will contain the form data
        var formData = {};

        //loop through the inputs and populate the formData array with the values 
        $("#addContact").children("input").each(function (i, el) {
          if ($(el).val() !== "") {
            formData[el.id] = $(el).val();
          }
        });

        //update data store
        contacts.push(formData);

        //re-render select if new type is unknown
        if (_.indexOf(this.getTypes(), formData.type) === -1) {
          this.collection.add(new Contact(formData));
          this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
        } 
        else {
          this.collection.add(new Contact(formData));
        }
      },


  });

  var ContactsRouter = Backbone.Router.extend({
    routes: {
      "filter/:type": "urlFilter"
    },
   
    urlFilter: function (type) {
      directory.filterType = type;
      directory.trigger("change:filterType");
    }
  });

  //instaniate the directory view
  var directory = new DirectoryView();

  //instaniate the contacts router 
  var contactsRouter = new ContactsRouter();

  //enable Backbone's history support so that it will monitor the URL for hash changes 
  Backbone.history.start();
 
} (jQuery));
