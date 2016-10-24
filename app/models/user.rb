class User < ActiveRecord::Base
  EMAIL_REGEX = /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]+)\z/i
  has_secure_password
  has_many :admins
  has_many :timeline_users
  has_many :timelines, through: :timeline_users

  validates :first_name, :last_name, :username, presence: true
  validates :email, presence: true, format: { with: EMAIL_REGEX }, uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 8 }, on: :create
  validates :password_confirmation, presence: true, on: :create

end
