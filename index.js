!(function(Mn, Bb, $, _) {
  var App = new Mn.Application;

  var _Drop = Drop.createContext({
    classPrefix: 'popover'
  });

  var PopoverService = Mn.Object.extend({

    initialize: function(options){

      this.channel = Bb.Radio.channel('popover');

      this.channel.reply({
        'open' : this.open,
        'close' : this.close
      }, this);

      _.bindAll(this, 'onClick');

    },

    open: function(options) {

      // close any open popovers
      this.close();

      // createContext defaults not working?
      _.defaults(options, {
        content   : '',
        position  : 'right middle',
        classes   : 'popover-theme-arrows',
        openOn    : undefined // manual trigger
      });

      // new Drop instance
      this.drop = new _Drop(options);

      // attach region
      this.drop.region = new Mn.Region({
        el: this.drop.content
      });

      // listeners
      $(document).on('click', this.onClick);
      options.view.on('show', this.drop.open, this.drop);

      // show
      this.drop.region.show(options.view);

    },

    close: function(){
      if( this.drop ){
        this.drop.region.empty();
        this.drop.destroy();
        this.drop = undefined;
        $(document).off('click', this.onClick);
      }
    },

    onClick: function(e){
      if( e.target === this.drop.target || $(e.target).closest('.popover').length ){
        return;
      }

      this.close();
    }

  });


  var View = Mn.ItemView.extend({
    template: _.template('' +
      '<h1><a data-action="popover1" href="#">Popover 1</a></h1>' +
      '<h1><a data-action="popover2" href="#">Popover 2</a></h1>'),

    ui: {
      popover1 : '[data-action="popover1"]',
      popover2 : '[data-action="popover2"]'
    },

    events: {
      'click @ui.popover1' : 'openPopover',
      'click @ui.popover2' : 'openPopover'
    },

    openPopover: function(e){
      var View = Mn.ItemView.extend({
        template: _.template('<button>Clicky</button>')
      });

      Bb.Radio.request('popover', 'open', {
        target  : e.target,
        view    : new View()
      });

    }
  });

  $(function() { App.start(); });

  App.on('start', function() {

    App.popoverService = new PopoverService();

    App.addRegions({
      'main': 'div'
    });

    App.getRegion('main').show(new View({
      model: new Bb.Model({})
    }));

  });

  $('[data-action="empty"]').click( function(){
    App.getRegion('main').empty();
  });

  window.App = App;

})(Marionette, Backbone, $, _);