/**
 * SETUP
 **/
  var app = app || {};

/**
 * MODELS
 **/
app.Search = Backbone.Model.extend({  
  url: function() {
    return 'http://innoboard.cc/1/post/tag/' + this.tag
  },
  tag: '',
  defaults: {
    success: false,
    errors: [],
    errfor: {},
    
    posts: [{
           "_id": '',
           "subject": ''
       }]
  }
});

app.Post = Backbone.Model.extend({  
  url: function() {
    return 'http://innoboard.cc/1/post' + this.query
  },
  query: '',
  defaults: {
    success: false,
    errors: [],
    errfor: {},
    
  	posts: [{
  	       "content": "hello",
  	       "_id": "5402de2f559097cdf139fff9",
  	       "subject": "abc123"
  	   }]
  }
});

app.SinglePost = Backbone.Model.extend({  
  url: 'http://innoboard.cc/1/post',
  defaults: {
    success: false,
    errors: [],
    errfor: {},

    content: '',
    title: ''
  }
});

app.PurchasePost = Backbone.Model.extend({  
  url: function() {
    return 'http://innoboard.cc/1/post/' + this.attributes.id + '/pay'
  },
  defaults: {
    success: false,
    errors: [],
    errfor: {},
  }
});

/**
 * VIEWS
 **/
  app.FormView = Backbone.View.extend({
    el: '#form-section',
    events: {
      'submit form': 'preventSubmit',
      'click #btn-submit': 'performSubmit'
    },
    initialize: function() {
        this.model = new app.SinglePost();

        this.template = _.template($('#tmpl-form').html());
        this.model.bind('change', this.render, this); 

        this.render();       
    },
    render: function() {
        var data = this.template(this.model.attributes);

        this.$el.html(data);
        return this;
    },
    preventSubmit: function(event) {
        event.preventDefault();
    },
    performSubmit: function(event) {
      event.preventDefault();

      var title = this.$el.find('#title').val();
      var content = this.$el.find('#content').val();

      this.model.save({
        title: title,
        content: content
      });

      app.postView.model.fetch();
    }
  });

  app.SearchView = Backbone.View.extend({
    el: '#search-section',
    events: {
      'click .btn-search': 'performSearch'
    },
    initialize: function() {
        this.model = new app.Search();
        this.template = _.template($('#tmpl-results').html());

        this.model.bind('change', this.render, this);        
    },
    render: function() {
        var data = this.template(this.model.attributes);

        $('#search-result').html(data);

        return this;
    },
    performSearch: function() {
      var tag = this.$el.find('#search-tag').val();

      this.model.tag = tag;
      this.model.fetch();
    }
  });

  app.PostView = Backbone.View.extend({
  	el: '#blog-post',
    events: {
      'click .btn-filter': 'performFilter',
      'click .btn-format': 'performFormat',
      'click [data-purchase-for]': 'performPurchase'
    },
    initialize: function() {
        this.model = new app.Post();
        this.purchase = new app.PurchasePost();
        this.template = _.template($('#tmpl-post').html());

        this.model.bind('change', this.render, this);

        this.model.fetch();
    },
    render: function() {
        var data = this.template(this.model.attributes);

        this.$el.html(data);

        return this;
    },
    performFilter: function() {
        this.model.query = '?sort=date';
        this.model.fetch();
    },
    performFormat: function() {
        this.$el.find('.post-date').each(function () {
          var me = $(this);
          me.html( moment( me.text() ).fromNow() );
        });
    },
    performPurchase: function(event) {
        var me = this.$el.find(event.target);
        var postId = me.data('purchase-for');
        var self = this;

        this.purchase.set('id', postId);
        this.purchase.save(this.model.attributes, {
          success: function(model, response, options) {
            alert('訂購成功。等候付款！');
            self.model.fetch();
          },
          error: function(model, response, options) {
            alert('失敗')
          }
        });
    }
  });

  app.QueryView = Backbone.View.extend({
    el: '#search-section',
    events: {
      'click .btn-search': 'performSearch',
      'input #search-tag': 'performSearch'
    },
    initialize: function() {
        this.template = _.template($('#tmpl-query').html());
        this.render();
    },
    render: function() {
        var data = this.template();

        this.$el.html(data);
        return this;
    },
    performSearch: function() {
      var query = this.$el.find('#search-tag').val();

      app.postView.model.query = '/' + query;
      app.postView.model.fetch();
    }
  });

/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.postView = new app.PostView();
    //app.searchView = new app.SearchView();
    app.formView = new app.FormView();
    app.queryView = new app.QueryView();
  });