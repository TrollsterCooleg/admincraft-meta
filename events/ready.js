const { ApplicationCommandType, ActivityType } = require('discord.js');
module.exports = async (client) => {
	client.logger.info('Bot started!');
	client.user.setPresence({ activities: [{ name: 'reddit.com/r/admincraft', type: ActivityType.Watching }] });
	// makes sure we fetch the application before we register the commands
	if (!client.application?.owner) await client.application?.fetch();
	// creates a list of all registered commands 
	const commands = await client.application?.commands.fetch();
	// loop through all the registered commands 
	await client.commands.forEach(async command => {
		const sourcecmd = commands.find(c => c.name == command.name);
		const opt = sourcecmd && command.options && `${JSON.stringify(sourcecmd.options)}` == `${JSON.stringify(command.options)}`;
		if ((opt || opt === undefined) && sourcecmd && command.description && sourcecmd.description == command.description) return;
		if (sourcecmd && command.type) return;
		client.logger.info(`Detected /${command.name} has some changes! Overwriting command...`);
		await client.application?.commands.create({
			name: command.name,
			type: command.type ? ApplicationCommandType[command.type] : ApplicationCommandType.ChatInput,
			description: command.description,
			options: command.options,
		});
	});
	await commands.forEach(async command => {
		if (client.commands.find(c => c.name == command.name)) return;
		client.logger.info(`Detected /${command.name} has been deleted! Deleting command...`);
		await command.delete();
	});
	const timer = (Date.now() - client.startTimestamp) / 1000;
	client.logger.info(`The bot took (${timer}s)! to start up!`);
};