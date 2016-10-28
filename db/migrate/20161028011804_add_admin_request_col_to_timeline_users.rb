class AddAdminRequestColToTimelineUsers < ActiveRecord::Migration
  def change
    add_column :timeline_users, :request, :integer
  end
end
