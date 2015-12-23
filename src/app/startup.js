import 'jquery';
import 'bootstrap';
import ko from 'knockout';
import 'knockout-projections'
import * as router from './router';
import 'app/ko_ext.js';

// Components can be packaged as AMD modules, such as the following:
ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });
ko.components.register('home-page', { require: 'components/home-page/home' });

// ... or for template-only components, you can just point to a .html file directly:
ko.components.register('about-page', {
    template: { require: 'text!components/about-page/about.html' }
});

ko.components.register('editable-text', { require: 'components/editable-text/editable-text' });

ko.components.register('accounts', { require: 'components/accounts/accounts' });

ko.components.register('investments', { require: 'components/investments/investments' });

ko.components.register('constraints', { require: 'components/constraints/constraints' });

// [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

// Start the application
ko.applyBindings({ route: router.currentRoute });
