(function ($) {
    
    //create the Contact model and set some defaults - set to empty string incase nothing is entered for that contact 
    var Contact = Backbone.Model.extend({
      defaults: {
          photo: "img/placeholder.png",
          name: "",
          address: "",
          tel: "",
          email: "",
          type: ""
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

      //the default template
      template: $("#contactTemplate").html(),

      //the edit template
      editTemplate: _.template($("#contactEditTemplate").html()),

      render: function () {
        var tmpl = _.template(this.template);
 
        this.$el.html(tmpl(this.model.toJSON()));
        return this;
      },

      //ui event for editing, saving and deleting a single contact 
      events: {
        "click button.delete": "deleteContact",
        "click button.edit": "editContact",
        "change select.type": "addType",
        "click button.save": "saveEdits",
        "click button.cancel": "cancelEdit"
      },
       
      //delete a single contact 
      deleteContact: function () {
        var removedType = this.model.get("type").toLowerCase();
       
        //destroy the model
        this.model.destroy();
       
        //remove the html (view) associated with this model 
        this.remove();
       
        //if this is the only contact with given type, remove from the select
        if (_.indexOf(directory.getTypes(), removedType) === -1) {
          directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
        }
      },

      //edit a single contact
      editContact: function () {
        this.$el.html(this.editTemplate(this.model.toJSON()));

        //add select to set type
        var newOpt = $("<option/>", {
            html: "<em>Add new...</em>",
            value: "addType"
        });

        this.select = directory.createSelect().addClass("type").val(this.$el.find("#type").val()).append(newOpt).insertAfter(this.$el.find(".name"));
        this.$el.find("input[type='hidden']").remove();
      },

      //add a new contact type
      addType: function () {
        if (this.select.val() === "addType") {
          this.select.remove();

          $("<input />", {
              "class": "type"
          }).insertAfter(this.$el.find(".name")).focus();
        }
      },

      //save edits made to a single contact
      saveEdits: function (e) {
        e.preventDefault();
       
        var formData = {},
        prev = this.model.previousAttributes();
       
        $(e.target).closest("form").find(":input").add(".photo").each(function () {
          var el = $(this);
          formData[el.attr("class")] = el.val();
        });
       
        if (formData.photo === "") {
          delete formData.photo;
        }
       
        this.model.set(formData);
       
        this.render();
       
        if (prev.photo === "/img/placeholder.png") {
          delete prev.photo;
        }
       
        _.each(contacts, function (contact) {
          if (_.isEqual(contact, prev)) {
            contacts.splice(_.indexOf(contacts, contact), 1, formData);
          }
        });
      },

      //cancel, don't save edits made to a contact 
      cancelEdit: function () {
        this.render();
      },
  
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

        //add new model 
        this.collection.on("add", this.renderContact, this);

        //remove a model 
        this.collection.on("remove", this.removeContact, this);
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
        "click #add": "addContact",
        "click #showForm": "showForm"
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

      //add a new contact model to the contacts collection 
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

      //remove a contact
      removeContact: function (removedModel) {
        //store the model's attributes 
        var removed = removedModel.attributes;
       
        if (removed.photo === "/img/placeholder.png") {
          delete removed.photo;
        }
       
        _.each(contacts, function (contact) {
          if (_.isEqual(contact, removed)) {
            contacts.splice(_.indexOf(contacts, contact), 1);
          }
        });
      },

      //toggle the form for adding a new contact
      showForm: function () {
        this.$el.find("#addContact").slideToggle();
      }


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
