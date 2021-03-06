#! /usr/bin/env node

/**
 * Created by pgotthardt on 07/12/15.
 */
var run = require('../index').run,
    path = require('path'),
    chalk = require('chalk'),
    argv = require('minimist')(process.argv.slice(2), {
        '--': true,
        default: {
            watch: false,
            'max-retries': Infinity,
            config: 'webpack.config.js',
            'parallel': require('os').cpus().length,
            json: false,
            colors: require('supports-color'),
            bail: true,
            stats: true
        },
        alias: {
            'm': 'max-retries',
            'p': 'parallel',
            'v': 'version'
        }
    }),
    configPath;

if(argv.version) {
    process.stdout.write('parallel-webpack ' + chalk.blue(require('../package').version) + "\n");
} else {
    try {
        chalk.enabled = argv.colors;
        configPath = path.resolve(argv.config);
        run(configPath, {
            watch: argv.watch,
            maxRetries: Number.parseInt(argv['max-retries'], 10),
            maxConcurrentWorkers: Number.parseInt(argv['parallel'], 10),
            bail: argv.bail,
            json: argv.json,
            modulesSort: argv['sort-modules-by'],
            chunksSort: argv['sort-chunks-by'],
            assetsSort: argv['sort-assets-by'],
            exclude: argv['display-exclude'],
            colors: argv['colors'],
            stats: argv['stats'],
            argv: argv['--']
        }).then(function(stats) {
            if(argv.json && stats) {
                process.stdout.write(JSON.stringify(stats.map(function(stat) {
                    return JSON.parse(stat);
                }), null, 2) + "\n");
            }
        }).catch(function(err) {
            if(err.message) {
                process.stdout.write(err.message + "\n");
                if(err.error) {
                    console.error(err.error);
                }
            } else {
                console.error(err);
            }
            process.exit(1);
        });
    } catch (e) {
        if(e.message) {
            process.stdout.write(e.message + "\n");
            console.error(e.error);
        } else {
            process.stdout.write(chalk.red('[WEBPACK]') + ' Could not load configuration ' + chalk.underline(process.cwd() + '/' + argv.config) + "\n");
        }
        process.exit(1);
    }
}
