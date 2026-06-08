user_memory = {}

def save_user_memory(user_id, key, value):

    if user_id not in user_memory:
        user_memory[user_id] = {}

    user_memory[user_id][key] = value

def get_user_memory(user_id):

    return user_memory.get(
        user_id,
        {}
    )