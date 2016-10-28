class Timeline < ActiveRecord::Base
	has_many :snapshots
	has_many :timeline_contents
	has_many :content_nodes, through: :timeline_contents
	has_many :timeline_admins, dependent: :destroy
	has_many :admins, through: :timeline_admins
	has_many :timeline_users, dependent: :destroy
	has_many :users, through: :timeline_users
	has_many :tags


	validates :title, presence: true, length: { minimum: 2 }
end
 