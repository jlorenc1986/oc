'use strict';

var cli = require('yargs');
var _ = require('underscore');

var autocomplete = require('./autocomplete');
var commands = require('./commands');
var Local = require('./domain/local');
var Registry = require('./domain/registry');
var strings = require('../resources');

var logger = {
  log: console.log,
  logNoNewLine: function(msg){
    return process.stdout.write(msg.toString());
  }
};

var dependencies = {
  local: new Local({ logger: logger }),
  logger: logger,
  registry: new Registry()
};

//autocomplete.init(_.keys(commands.oc));

/*cli.option('completion', {
  hidden: true,
  callback: autocomplete.setup,
  flag: true
});*/

function processCommand(command, commandName, cli, prefix){
  prefix = prefix || '';
  var facade = require('./facade/' + prefix + commandName)(dependencies);

  cli
    .command(
      command.cmd || commandName,
      command.help,
      function(yargs){
        if(!!command.options){
          yargs.options(command.options);
        }

        if(!!command.commands){
          var newPrefix = (!!prefix ? prefix + '-' : '') + commandName + '-';         // too complicated - should be simplified
          _.mapObject(command.commands, function(commandConfiguration, commandName){
            processCommand(commandConfiguration, commandName, yargs, newPrefix);
          });
        }

        if(!!command.example){
          yargs
            .example(
              command.example.cmd,
              command.example.description);
        }

        return yargs;
      },
      !!command.commands ? undefined : facade       ///add throwing error - not valid, or whatever
    );

  

  /*if(!!command.options){
    cliCommand.options(_.object(_.keys(command.options), _.map(command.options, function(option){
      return _.extend(option, {
        list: false
      });
    })));
  }*/

}

_.forEach(commands, function(commandsConfiguration, commandsConfigurationName){
  _.forEach(commandsConfiguration, function(command, commandName) {
    processCommand(command, commandName, cli);
  });
});

cli
  .help('h')
  .alias('h', 'help')
  .wrap(cli.terminalWidth())
  .locale('pirate')
  .argv;


//cli.help(strings.messages.cli.HELP_HINT).parse();


//todo:
// autocomplete
// npm i --save
// shrinkwrap
// print help when none command has been provided
// print usage information
// check whether all the functions work (validation of parameters)
// check feature parity with the current parser
//  -> if there is a difference - note it - ask in PR if whether it's acceptable
// refactor maybe help/describe to description (like for options)
// types of options can be provided in help
// current form of version might be changed (?)
// add example to each command (see publish and preview)

// to restructure:
//  registry functions (+ handling wrong not accpetable command passed)

