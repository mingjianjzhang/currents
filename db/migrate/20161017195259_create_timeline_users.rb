class CreateTimelineUsers < ActiveRecord::Migration
  def change
    create_table :timeline_users do |t|
      t.references :user, index: true
      t.references :timeline, index: true

      t.timestamps null: false
    end
    add_foreign_key :timeline_users, :users
    add_foreign_key :timeline_users, :timelines
  end
end
