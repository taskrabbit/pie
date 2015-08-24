// *** 1 ***

// This is the entry point to the application. All pie apps start by definin an app instance.

window.app = pie.app.create({});

// Then if you so choose, you can set up routes.
app.router.map({ '/*path' : {view: 'layout'} });

// Generally, we build routes, i18n, define resources, etc in one spot.
app.i18n.load({
  emptyState: "${incompleted.zero}",
  removeAction: "remove completed",
  completeAllAction: "mark all completed",
  incompleted: {
    zero: "no incomplete tasks",
    one: "1 incomplete task",
    other: "%{count} incomplete tasks"
  }
});


// Now move on to models.js
