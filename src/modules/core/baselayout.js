define(function(require) {

  var Layout = require("layoutmanager");

  Layout.configure({ manage: true });

  var TopbarView = require('src/modules/components/topbar');
  var VisView = require('src/modules/components/vis');
  var QuestionBreakdownView = require('src/modules/components/question-breakdown');
  var FooterView = require("src/modules/components/footer");

  // Use main layout and set Views.

  var topbarView = new TopbarView();
  var footerView = new FooterView();
  var visView = new VisView();
  var questionBreakdownView = new QuestionBreakdownView();

  var MainLayout = Layout.extend({
    el: "#main",
    template: require("tmpl!src/modules/layouts/main"),
    views: {
      '#topbar': topbarView,
      '#vis' : visView,
      '#question-breakdown': questionBreakdownView,
      '#bottombar' : footerView,

    },

    setData: function(data) {
      this.data = data;
      topbarView.setData(data);
      visView.setData(data);
      questionBreakdownView.setData(data);
      footerView.setData(data);
    },

    updateQuestion: function(question, highlights, clear) {
      // clear highlight
      if (clear) {
        visView.highlightProperties([]);
      }
      // set question
      if (question) {
        questionBreakdownView.setQuestion(question);
      }
      // highlight breakdown
      if (highlights) {
        visView.highlightProperties(highlights);
      }

      // if this is just a single highlight
      if (question && this.data.questions_no_order.indexOf(question) > -1) {
        visView.highlightProperties([question]);
      }
    },

    updateChart: function() {
      visView.updateChart();
    },

    updateBreakdown: function(breakdown, question) {

      this.breakdown = breakdown;

      // update the waffle chart
      if (question) {
        visView.updateGrid(breakdown, question);
      } else {
        visView.updateGrid(breakdown);
      }

      // update footer, top and questions view if
      // if questions aren't rendered or the breakdown changed
      if (!footerView.areQuestionsRendered() ||
          footerView.getBreakdown() !== breakdown) {
        footerView.renderQuestions(breakdown);

        // update the categories at the top only if breakdown changed
        topbarView.updateGrid(breakdown, visView.getDimensions());

        // update the breakdown in a question breakdown view
        questionBreakdownView.setBreakdown(breakdown);
      }
    }
  });

  // navigate if we're switching breakdowns. Paths:
  // breakdown/versions, breakdown/age, breakdown/dependencies
  footerView.on('navigate', function(path) {
    layout.trigger('navigate', path);
  });

  // when a user switches a question, clear the current highlights and
  // navigate away
  footerView.on('question-switch', function(breakdown, question) {
    if (questionBreakdownView.getQuestion() !== question) { visView.highlightProperties([]); }
    layout.trigger('navigate', 'breakdown/' + breakdown + '/question/' + question); // navigate
  });

  questionBreakdownView.on('highlight-subset', function(subset) {
    layout.updateQuestion(null, subset, false);
    layout.updateChart();
  });

  var layout = new MainLayout();
  return layout;
});
